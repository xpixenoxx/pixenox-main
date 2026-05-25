const url = 'http://localhost:3000/';

async function run() {
  let attempt = 1;
  let concurrency = 10;
  let totalRequests = 0;

  console.log(`Starting load test on ${url}...`);

  while (true) {
    console.log(`\nAttempt ${attempt} - Sending ${concurrency} concurrent requests...`);
    const promises = [];
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        fetch(url, { cache: 'no-store' }).then(res => {
          if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
          return res.status;
        })
      );
    }

    try {
      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;
      totalRequests += concurrency;
      
      console.log(`✅ Success in ${duration}ms! Total requests so far: ${totalRequests}`);
      
      attempt++;
      concurrency += 20; // Increase load
    } catch (err) {
      console.error(`\n💥 CRASHED at attempt ${attempt}!`);
      console.error(`Load at time of crash: ${concurrency} concurrent requests.`);
      console.error(`Total successful requests before crash: ${totalRequests}`);
      console.error(`Error details: ${err.message}`);
      break;
    }
    
    // Give the server a tiny breather (500ms) before the next wave
    await new Promise(r => setTimeout(r, 500));
  }
}

run();
