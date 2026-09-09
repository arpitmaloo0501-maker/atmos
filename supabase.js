import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rblcrsboalpuhofaeqol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibGNyc2JvYWxwdWhvZmFlcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2ODM3NTQsImV4cCI6MjEwNDI1OTc1NH0.dKh0sPbzAlKpPxP0KSVb3YSSVYhbEdPTA5gufHxmHqM';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const STORAGE_BUCKET = 'evidence_media';