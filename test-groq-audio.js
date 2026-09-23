const fs = require('fs');
const { Groq } = require('groq-sdk');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/GROQ_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.error("NO API KEY");
  process.exit(1);
}

async function test() {
  const groq = new Groq({ apiKey });
  try {
    const mp3 = await groq.audio.speech.create({
      model: "canopylabs/orpheus-v1-english",
      voice: "hannah",
      input: "Hello there.",
      response_format: "mp3",
    });
    console.log("SUCCESS!");
  } catch (err) {
    console.error("GROQ ERROR:", err);
  }
}
test();
