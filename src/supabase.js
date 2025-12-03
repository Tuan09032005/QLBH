// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aykpggobvgotfhmmecew.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5a3BnZ29idmdvdGZobW1lY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDM5NTQsImV4cCI6MjA3ODQ3OTk1NH0.hfdWo68s9vfBQaohROqH9lmKipTYvrjDqBqgyjyNYn4";
export const supabase = createClient(supabaseUrl, supabaseKey);
