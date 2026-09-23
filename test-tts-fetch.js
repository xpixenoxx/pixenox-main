require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "orpheus",
        voice: "hannah",
        input: "Hello there, I am Pixy.",
        response_format: "mp3"
      })
    });
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log(text.slice(0, 100));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
