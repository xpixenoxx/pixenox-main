const fs = require('fs');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('.env.local'));
const apiKey = env.GROQ_API_KEY;

fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [{ role: 'system', content: 'Output MUST be JSON. { "messages": ["hello"]}'}, { role: 'user', content: 'Say hello'}],
    response_format: { type: 'json_object' }
  })
}).then(r=>r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
