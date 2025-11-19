import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  // Find old 'New' jobs
  const { data: jobs } = await supabase.from('jobs')
    .select('*').eq('status', 'New').lt('created_at', yesterday);

  if (!jobs || !jobs.length) return res.json({ message: "No follow-ups needed" });

  // Process them
  for (const job of jobs) {
    await supabase.from('jobs').update({ status: 'Follow-up Sent' }).eq('id', job.id);
    console.log(`[MOCK SMS] Follow-up to ${job.name}: Still interested in ${job.job_type}?`);
  }

  res.json({ success: true, count: jobs.length });
}