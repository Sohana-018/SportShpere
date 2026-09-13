require('dotenv').config({ path: '.env.local' });

async function getOpenAPI() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  });
  const json = await response.json();
  
  if (json.definitions && json.definitions.messages) {
    console.log(JSON.stringify(json.definitions.messages.properties, null, 2));
  } else {
    console.log("No messages table found in OpenAPI spec.");
  }
}

getOpenAPI();
