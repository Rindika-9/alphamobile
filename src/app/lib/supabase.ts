import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zniorpwllbdiuzvrcucr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaW9ycHdsbGJkaXV6dnJjdWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDkxODUsImV4cCI6MjA5NjgyNTE4NX0.QCbZ2xxNXEEE8HzEoWqQxdrsEM6LINs6RGpy5FwQpmg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
