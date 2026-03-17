import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://huotllplzskmfwnmiceg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1b3RsbHBsenNrbWZ3bm1pY2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTc1MDYsImV4cCI6MjA4ODg5MzUwNn0.fH7C27yHHWiwENmCVTGm5B8NgjB6KDerMeKN86xR_xI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);