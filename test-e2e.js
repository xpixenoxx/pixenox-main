const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3000/contact/pixy');
  console.log('Opened page');
  
  // Start interact
  await page.click('text=Tap anywhere to start');
  await page.waitForTimeout(500);

  // Intro
  await page.click('text=Start a project');
  
  // Name
  await page.waitForSelector('input[type="text"]');
  await page.fill('input[type="text"]', 'E2E Tester');
  await page.click('button[aria-label="Submit"]');
  
  // Services
  await page.waitForSelector('text=AI Engineering', { timeout: 30000 });
  await page.click('text=AI Engineering');
  
  // Company & Job
  await page.waitForSelector('input[placeholder="Pixenox Inc."]');
  await page.fill('input[placeholder="Pixenox Inc."]', 'Acme Corp');
  await page.fill('input[placeholder="Lead AI Developer..."]', 'Engineer');
  await page.click('button[aria-label="Submit"]');
  
  // Budget
  await page.waitForSelector('text=Over ');
  await page.click('text=Over ');
  
  // Launch timeline
  await page.waitForSelector('text=Immediate');
  await page.click('text=Immediate');
  
  // Project description
  await page.waitForSelector('textarea');
  await page.fill('textarea', 'E2E Testing Project Desc');
  await page.click('button[aria-label="Submit"]');
  
  // Email!
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'e2e@example.com');
  
  // Wait to capture network requests
  const requestPromise = page.waitForRequest(request => request.url().includes('/api/contact') && request.method() === 'POST', { timeout: 10000 }).catch(e => console.log('No /api/contact request found'));
  
  await page.click('button[aria-label="Submit"]');
  console.log('Clicked submit email');
  
  await requestPromise;
  await page.waitForTimeout(2000);
  
  console.log('Test complete');
  await browser.close();
})();
