import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AuthPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: "citizen" | "mla_office" | "staff" | "reviewer";
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

    const { email, password, firstName, lastName, userType }: AuthPayload =
      await req.json();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { user_type: userType },
      });

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: authError?.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create audit log
    await supabase
      .from("audit_logs")
      .insert({
        action: "user.created",
        resource_type: "user",
        resource_id: authData.user.id,
        user_id: authData.user.id,
        changes: {
          email,
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        message: "User created successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
