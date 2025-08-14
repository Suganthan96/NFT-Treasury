const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateFlowchartImages() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'flowchart.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  // Wait for mermaid to render
  await page.waitForTimeout(3000);
  
  // Take screenshot of entire page
  await page.screenshot({
    path: 'nft-treasury-complete-flowchart.png',
    fullPage: true,
    type: 'png'
  });
  
  // Take individual section screenshots
  const sections = [
    { selector: '.mermaid:nth-of-type(1)', name: 'main-application-flow' },
    { selector: '.mermaid:nth-of-type(2)', name: 'membership-verification' },
    { selector: '.mermaid:nth-of-type(3)', name: 'nft-purchase-flow' },
    { selector: '.mermaid:nth-of-type(4)', name: 'tier-system' },
    { selector: '.mermaid:nth-of-type(5)', name: 'security-access' },
    { selector: '.mermaid:nth-of-type(6)', name: 'technology-stack' }
  ];
  
  for (const section of sections) {
    const element = await page.$(section.selector);
    if (element) {
      await element.screenshot({
        path: `${section.name}.png`,
        type: 'png'
      });
    }
  }
  
  await browser.close();
  console.log('✅ Flowchart images generated successfully!');
}

// Run if node.js available
if (typeof module !== 'undefined') {
  generateFlowchartImages().catch(console.error);
}
