// Test script to simulate BitBadges webhook for Gold membership
const fetch = require('node-fetch');

const testWebhook = async () => {
  // Replace with your wallet address to test
  const testWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
  
  const webhookData = {
    claimAttemptId: "test-claim-123",
    collectionId: "nft-treasury-gold-collection",
    badgeId: "Gold",
    from: testWalletAddress,
    claimInfo: {
      claimId: "gold-claim-456",
      plugins: [],
      manualDistribution: false
    },
    timestamp: new Date().toISOString(),
    pluginSecret: "nft-treasury-gold-webhook-2025"
  };

  console.log('🚀 Testing BitBadges Webhook...');
  console.log('📡 Sending webhook data:', JSON.stringify(webhookData, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/bitbadges-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    console.log('✅ Webhook test successful:', result);
    
    // Wait a moment then check the benefits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const benefitsResponse = await fetch(`http://localhost:3001/api/gold-benefits/${testWalletAddress}`);
    const benefits = await benefitsResponse.json();
    console.log('🥇 Gold benefits activated:', JSON.stringify(benefits, null, 2));
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
};

testWebhook();
