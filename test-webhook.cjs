// Test script to simulate BitBadges webhook for Gold membership
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testWebhook = async () => {
  // Using the exact format from BitBadges example payload with Gold tier indicators
  const webhookData = {
    "pluginSecret": "nft-treasury-gold-webhook-2025",
    "claimId": "9c2dcc38dae73e1736b024e67bc6030f",
    "claimAttemptId": "abc123",
    "lastUpdated": 1800000000000,
    "createdAt": 1800000000000,
    "version": "0",
    "_isSimulation": false,
    "_attemptStatus": "success",
    "isAddressSignedIn": true,
    "bitbadgesAddress": "bb1tz8kkvtf7cqhdsg58796k3au700whmxuf0g",
    "ethAddress": "0x588f6b3169f60176c1143f8BaB47bCf3DeEbECdc",
    "solAddress": "...",
    "btcAddress": "bc1qtz8kkvtf7cqhdsg58796k3au700whmxug7nq4",
    "badgeId": "gold-membership-badge",
    "collectionId": "nft-treasury-gold-collection",
    "email": "suganthan.27it@licet.ac.in",
    "discord": {
      "id": "suganthan96",
      "username": "Suganthan96",
      "discriminator": "0001"
    },
    "metadata": {
      "email": "suganthan.27it@licet.ac.in",
      "discord": {
        "id": "suganthan96",
        "username": "Suganthan96",
        "discriminator": "0001"
      }
    }
  };

  console.log('🚀 Testing BitBadges Webhook with real payload format...');
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
    
    // Use the ethAddress from the webhook data
    const testAddress = webhookData.ethAddress;
    const benefitsResponse = await fetch(`http://localhost:3001/api/gold-benefits/${testAddress}`);
    const benefits = await benefitsResponse.json();
    console.log('🥇 Gold benefits activated:', JSON.stringify(benefits, null, 2));
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
};

testWebhook();
