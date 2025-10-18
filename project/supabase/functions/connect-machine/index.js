import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { machineKey, userName } = await req.json();

    if (!machineKey || !userName) {
      return new Response(
        JSON.stringify({ error: 'Machine key and user name are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('*')
      .eq('machine_key', machineKey)
      .maybeSingle();

    if (machineError || !machine) {
      return new Response(
        JSON.stringify({ error: 'Machine not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (machine.status !== 'online') {
      return new Response(
        JSON.stringify({ error: 'Machine is currently offline' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ name: userName }])
      .select()
      .single();

    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const socketRoom = `machine-${machine.id}-${user.id}`;

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        machine_id: machine.id,
        user_id: user.id,
        socket_room: socketRoom,
        status: 'active',
      }])
      .select()
      .single();

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        machine,
        user,
        session,
        socketRoom,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
