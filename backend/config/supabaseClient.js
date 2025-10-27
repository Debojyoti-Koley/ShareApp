import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  // process.env.REACT_APP_SUPABASE_ANON_KEY
  process.env.SERVICE_ROLE_KEY
);

export default supabase;