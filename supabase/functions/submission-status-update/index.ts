import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface StatusUpdatePayload {
  submissionId: string;
  newStatus: string;
  notes?: string;
  assignedTo?: string;
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

    const { submissionId, newStatus, notes, assignedTo }: StatusUpdatePayload =
      await req.json();

    // 1. Get current submission
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Update submission status
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: newStatus,
        assigned_to: assignedTo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create status history entry
    await supabase
      .from("submission_status_history")
      .insert({
        submission_id: submissionId,
        status: newStatus,
        notes: notes || `Status changed to ${newStatus}`,
      });

    // 4. Create notification for citizen
    const notificationMessage = `Your submission ${submission.submission_number} has been ${newStatus.replace(/_/g, " ")}`;

    await supabase
      .from("notifications")
      .insert({
        recipient_id: submission.citizen_id,
        type: "submission_status",
        title: "Submission Status Updated",
        message: notificationMessage,
        data: {
          submission_id: submissionId,
          submission_number: submission.submission_number,
          new_status: newStatus,
        },
      });

    // 5. Create audit log
    const userId = authHeader.replace("Bearer ", "");
    await supabase
      .from("audit_logs")
      .insert({
        action: "submission.status_updated",
        resource_type: "submission",
        resource_id: submissionId,
        user_id: userId,
        organization_id: submission.organization_id,
        changes: {
          old_status: submission.status,
          new_status: newStatus,
          assigned_to: assignedTo,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        submission: { ...submission, status: newStatus },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
