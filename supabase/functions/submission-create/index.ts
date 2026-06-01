import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface SubmissionPayload {
  organizationId: string;
  citizenId: string;
  categoryId: string;
  title: string;
  description: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      organizationId,
      citizenId,
      categoryId,
      title,
      description,
      priority = "normal",
    }: SubmissionPayload = await req.json();

    // 1. Generate submission number
    const { data: countData } = await supabase
      .from("submissions")
      .select("submission_number", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const submissionNumber = `SUB-${organizationId.slice(0, 3).toUpperCase()}-${(countData?.length || 0) + 1}`;

    // 2. Create submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        organization_id: organizationId,
        citizen_id: citizenId,
        category_id: categoryId,
        submission_number: submissionNumber,
        title,
        description,
        priority,
        status: "drafted",
      })
      .select()
      .single();

    if (submissionError || !submission) {
      return new Response(JSON.stringify({ error: submissionError?.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create initial status history entry
    await supabase
      .from("submission_status_history")
      .insert({
        submission_id: submission.id,
        status: "drafted",
        notes: "Submission created",
      });

    // 4. Create audit log
    await supabase
      .from("audit_logs")
      .insert({
        action: "submission.created",
        resource_type: "submission",
        resource_id: submission.id,
        user_id: citizenId,
        organization_id: organizationId,
        changes: {
          submission_number: submissionNumber,
          title,
          category_id: categoryId,
        },
      });

    return new Response(JSON.stringify({ success: true, submission }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
