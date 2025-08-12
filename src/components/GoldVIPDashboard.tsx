import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface GoldBenefits {
  exclusiveNFTs: boolean;
  premiumAnalytics: boolean;
  vipAccess: boolean;
  bonusTokens: number;
  personalizedPortfolio: boolean;
  exclusiveEvents: boolean;
  earlyAccess: boolean;
}

interface GoldMemberData {
  hasGoldBenefits: boolean;
  benefits?: GoldBenefits;
  claimedAt?: string;
}

const GoldVIPDashboard: React.FC = () => {
  const { address } = useAccount();
  const [goldData, setGoldData] = useState<GoldMemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      checkGoldBenefits();
    }
  }, [address]);

  const checkGoldBenefits = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/gold-benefits/${address}`);
      const data = await response.json();
      setGoldData(data);
    } catch (error) {
      console.error('Error checking Gold benefits:', error);
      setGoldData({ hasGoldBenefits: false });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.1))',
        border: '2px solid rgba(255,215,0,0.3)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#FFD700' }}>Checking Gold VIP Status...</p>
      </div>
    );
  }

  if (!goldData?.hasGoldBenefits) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(100,100,100,0.1), rgba(50,50,50,0.1))',
        border: '2px solid rgba(255,215,0,0.2)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>Gold VIP Dashboard</h3>
        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
          Exclusive real-time benefits activated via BitBadges webhook
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          Claim your Gold membership badge to unlock instant VIP features
        </p>
      </div>
    );
  }

  const { benefits, claimedAt } = goldData;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.15))',
      border: '2px solid rgba(255,215,0,0.4)',
      borderRadius: '20px',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Golden glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
        animation: 'goldPulse 3s ease-in-out infinite',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑</div>
          <h2 style={{ 
            color: '#FFD700', 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(255,215,0,0.5)'
          }}>
            Gold VIP Dashboard
          </h2>
          <p style={{ color: '#FFA500', fontSize: '1rem' }}>
            ✨ Exclusive benefits activated via webhook
          </p>
          {claimedAt && (
            <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              VIP since: {new Date(claimedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Exclusive NFTs */}
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
            <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Exclusive NFTs</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Access to limited edition, Gold-only NFT drops
            </p>
            {benefits?.exclusiveNFTs && (
              <div style={{ 
                background: 'rgba(0,255,0,0.2)', 
                color: '#00FF00', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '0.5rem',
                fontSize: '0.8rem'
              }}>
                ✅ ACTIVE
              </div>
            )}
          </div>

          {/* Premium Analytics */}
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Premium Analytics</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Real-time market insights and personalized reports
            </p>
            {benefits?.premiumAnalytics && (
              <div style={{ 
                background: 'rgba(0,255,0,0.2)', 
                color: '#00FF00', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '0.5rem',
                fontSize: '0.8rem'
              }}>
                ✅ ACTIVE
              </div>
            )}
          </div>

          {/* Bonus Tokens */}
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🪙</div>
            <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Bonus Tokens</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              {benefits?.bonusTokens || 0} bonus tokens awarded instantly
            </p>
            <div style={{ 
              background: 'rgba(0,255,0,0.2)', 
              color: '#00FF00', 
              padding: '0.5rem', 
              borderRadius: '6px', 
              marginTop: '0.5rem',
              fontSize: '0.8rem'
            }}>
              ✅ AWARDED
            </div>
          </div>

          {/* Exclusive Events */}
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎪</div>
            <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>VIP Events</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Exclusive access to Gold-only events and meetups
            </p>
            {benefits?.exclusiveEvents && (
              <div style={{ 
                background: 'rgba(0,255,0,0.2)', 
                color: '#00FF00', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '0.5rem',
                fontSize: '0.8rem'
              }}>
                ✅ INVITED
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'black',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            📊 View Analytics
          </button>

          <button style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'black',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            🎨 Browse VIP NFTs
          </button>

          <button style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'black',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            🎪 View Events
          </button>
        </div>

        {/* Webhook Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            🚀 <strong>Real-time activation:</strong> These benefits were instantly unlocked via BitBadges webhook
          </p>
          <p style={{ color: '#666', fontSize: '0.7rem' }}>
            Powered by automated smart contract integration
          </p>
        </div>
      </div>

      <style>{`
        @keyframes goldPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default GoldVIPDashboard;
