import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface NotificationPayload {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
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

    const { recipientId, type, title, message, data }: NotificationPayload =
      await req.json();

    if (!recipientId || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create notification
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        recipient_id: recipientId,
        type,
        title,
        message,
        data: data || {},
      })
      .select()
      .single();

    if (notificationError) {
      return new Response(
        JSON.stringify({ error: notificationError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, notification }), {
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
