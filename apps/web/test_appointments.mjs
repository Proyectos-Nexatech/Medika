import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('appointments').select('*, patients(first_name, last_name), professionals(first_name, last_name), services(name, duration_minutes)')
  if (error) {
    console.error('ERROR:', JSON.stringify(error, null, 2))
  } else {
    console.log('SUCCESS:', data)
  }
}

test()