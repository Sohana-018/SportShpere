require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          athlete_sports (
            id,
            sport_id,
            skill_level,
            sports (id, name)
          )
        `)
        .limit(1);
  console.log("Without alias:", JSON.stringify(data, null, 2), error);
  
  const { data: data2, error: err2 } = await supabase
        .from("profiles")
        .select(`
          id,
          athlete_sports (
            id,
            sport_id,
            skill_level,
            sports:sport_id (id, name)
          )
        `)
        .limit(1);
  console.log("With alias:", JSON.stringify(data2, null, 2), err2);
}
test();
