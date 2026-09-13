require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  // Let's create a test user first or use an existing one to test the insert.
  // Actually, anon key might fail RLS if not authenticated. We can just try and see the error.
  const { data, error } = await supabase.from('messages').insert([
    {
      sender_id: '123e4567-e89b-12d3-a456-426614174000',
      receiver_id: '123e4567-e89b-12d3-a456-426614174000',
      message: 'test message'
    }
  ]);
  
  console.log("Insert result:", { data, error });
}

testInsert();
