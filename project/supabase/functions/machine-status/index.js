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

    const url = new URL(req.url);
    const machineKey = url.searchParams.get('machineKey');

    if (!machineKey) {
      return new Response(
        JSON.stringify({ error: 'Machine key is required' }),
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

    const { data: queueJobs, error: queueError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('machine_id', machine.id)
      .in('status', ['queued', 'printing'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (queueError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch queue' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        machine,
        queue: queueJobs || [],
        queueLength: queueJobs?.length || 0,
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
