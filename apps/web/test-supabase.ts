import { supabase } from './src/lib/supabase';

async function test() {
    const { data } = await supabase.from('patients').select('*');
    const x: string = data[0].id;
}
