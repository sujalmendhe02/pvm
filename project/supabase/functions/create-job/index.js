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

    const {
      machineId,
      userId,
      userName,
      fileUrl,
      fileName,
      totalPages,
      pagesToPrint,
      pagesCount,
      priority,
    } = await req.json();

    if (!machineId || !userId || !fileUrl || !totalPages || !pagesToPrint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('rate_per_page')
      .eq('id', machineId)
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

    const priorityFactor = priority === 1 ? 1.5 : 1.0;
    const cost = pagesCount * machine.rate_per_page * priorityFactor;

    const { data: job, error: jobError } = await supabase
      .from('print_jobs')
      .insert([{
        machine_id: machineId,
        user_id: userId,
        user_name: userName,
        file_url: fileUrl,
        file_name: fileName,
        total_pages: totalPages,
        pages_to_print: pagesToPrint,
        pages_count: pagesCount,
        priority: priority || 2,
        status: 'queued',
        cost: cost.toFixed(2),
        payment_status: 'pending',
      }])
      .select()
      .single();

    if (jobError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create print job', details: jobError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: queueJobs } = await supabase
      .from('print_jobs')
      .select('id, priority, created_at')
      .eq('machine_id', machineId)
      .in('status', ['queued', 'printing'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    const queuePosition = queueJobs.findIndex(j => j.id === job.id) + 1;

    return new Response(
      JSON.stringify({
        success: true,
        job,
        queuePosition,
        queueLength: queueJobs.length,
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
