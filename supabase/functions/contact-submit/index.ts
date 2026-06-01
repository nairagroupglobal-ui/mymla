import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  organizationId?: string;
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

    const { name, email, message, organizationId }: ContactPayload =
      await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Save contact message
    const { data: contactMsg, error: contactError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        organization_id: organizationId || null,
        status: "new",
      })
      .select()
      .single();

    if (contactError) {
      return new Response(JSON.stringify({ error: contactError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send notification to admins
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_type", "super_admin");

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabase
          .from("notifications")
          .insert({
            recipient_id: admin.id,
            type: "contact_message",
            title: "New Contact Message",
            message: `From: ${name} (${email})`,
            data: { contact_message_id: contactMsg.id },
          });
      }
    }

    return new Response(JSON.stringify({ success: true, contactMsg }), {
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
