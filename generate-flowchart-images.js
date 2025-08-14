// Install required packages first:
// npm install puppeteer

const puppeteer = require('puppeteer');
const path = require('path');

async function generateFlowchartImages() {
  console.log('🚀 Starting image generation...');
  
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'flowchart.html');
    await page.goto(`file://${htmlPath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for mermaid diagrams to render
    await page.waitForTimeout(5000);
    
    console.log('📸 Capturing complete flowchart...');
    // Take screenshot of entire page
    await page.screenshot({
      path: 'nft-treasury-complete-flowchart.png',
      fullPage: true,
      type: 'png'
    });
    
    console.log('📸 Capturing individual sections...');
    // Individual section screenshots
    const sections = [
      { selector: '.mermaid:nth-of-type(1)', name: '1-main-application-flow.png' },
      { selector: '.mermaid:nth-of-type(2)', name: '2-membership-verification.png' },
      { selector: '.mermaid:nth-of-type(3)', name: '3-nft-purchase-flow.png' },
      { selector: '.mermaid:nth-of-type(4)', name: '4-tier-system.png' },
      { selector: '.mermaid:nth-of-type(5)', name: '5-security-access.png' },
      { selector: '.mermaid:nth-of-type(6)', name: '6-technology-stack.png' }
    ];
    
    for (const section of sections) {
      try {
        const element = await page.$(section.selector);
        if (element) {
          await element.screenshot({
            path: section.name,
            type: 'png'
          });
          console.log(`✅ Generated: ${section.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to capture ${section.name}:`, error.message);
      }
    }
    
    console.log('🎉 All images generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating images:', error);
  } finally {
    await browser.close();
  }
}

// Run the function
generateFlowchartImages().catch(console.error);
