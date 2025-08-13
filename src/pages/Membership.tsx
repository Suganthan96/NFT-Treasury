import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Navbar from '../components/Navbar';
import DiscordAccess from '../components/DiscordAccess';
import { useMembershipNFTs } from '../hooks/useNFTCount';
import { 
  MEMBERSHIP_TIERS, 
  getUserMembershipStatus, 
  claimMembershipBadge,
  MembershipTier
} from '../utils/bitbadges';
import '../index.css';

interface MembershipStatus {
  eligibleTier: MembershipTier | null;
  ownedBadges: { [key: string]: boolean };
  nftCount: number;
  canClaim: boolean;
}

export default function Membership() {
  const { address, nftCount, loading, error, isConnected } = useMembershipNFTs();
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [claiming, setClaiming] = useState<string>('');
  const [claimError, setClaimError] = useState<string>('');
  const [claimSuccess, setClaimSuccess] = useState<string>('');

  // Check membership status when user connects or NFT count changes
  useEffect(() => {
    async function checkStatus() {
      if (address && !loading) {
        try {
          const status = await getUserMembershipStatus(address, nftCount);
          setMembershipStatus(status);
        } catch (err) {
          console.error('Error checking membership status:', err);
        }
      }
    }

    checkStatus();
  }, [address, nftCount, loading]);

  const handleClaimBadge = async (tier: MembershipTier) => {
    if (!address) return;

    setClaiming(tier.name);
    setClaimError('');
    setClaimSuccess('');

    try {
      await claimMembershipBadge(address, tier);
      setClaimSuccess(`Successfully claimed ${tier.name} badge!`);
      
      // Refresh membership status
      const updatedStatus = await getUserMembershipStatus(address, nftCount);
      setMembershipStatus(updatedStatus);
    } catch (err) {
      setClaimError(`Failed to claim ${tier.name} badge: ${(err as Error).message}`);
    } finally {
      setClaiming('');
    }
  };

  const renderTierCard = (tier: MembershipTier, index: number) => {
    const isEligible = nftCount >= tier.minNFTs;
    const hasOwned = membershipStatus?.ownedBadges[tier.name] || false;
    const canClaim = isEligible && !hasOwned;

    return (
      <div 
        key={tier.name}
        className="tier-card"
        style={{
          background: isEligible ? `linear-gradient(135deg, ${tier.color}20, ${tier.color}10)` : '#2a2a2a',
          border: isEligible ? `2px solid ${tier.color}` : '2px solid #555',
          borderRadius: '16px',
          padding: '2rem',
          margin: '1rem',
          textAlign: 'center',
          opacity: isEligible ? 1 : 0.6,
          transition: 'all 0.3s ease',
          minWidth: '280px'
        }}
      >
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: tier.color 
        }}>
          {index === 0 ? '🥉' : index === 1 ? '🥈' : '🥇'}
        </div>
        
        <h3 style={{ 
          color: tier.color, 
          fontSize: '1.5rem', 
          margin: '0 0 1rem 0',
          fontWeight: 'bold' 
        }}>
          {tier.name} Tier
        </h3>
        
        <p style={{ 
          color: '#ccc', 
          marginBottom: '1rem',
          fontSize: '1rem' 
        }}>
          Requires {tier.minNFTs} NFT{tier.minNFTs > 1 ? 's' : ''}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Benefits:</h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            color: '#bbb'
          }}>
            {tier.benefits.map((benefit, i) => (
              <li key={i} style={{ margin: '0.25rem 0' }}>
                ✓ {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '8px',
            background: hasOwned ? '#10B981' : isEligible ? '#F59E0B' : '#555',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {hasOwned ? '✅ Owned' : isEligible ? '✓ Eligible' : '❌ Need more NFTs'}
          </div>
        </div>

        {canClaim && (
          <button
            onClick={() => handleClaimBadge(tier)}
            disabled={claiming === tier.name}
            style={{
              padding: '0.75rem 1.5rem',
              background: `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)`,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              cursor: claiming === tier.name ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (claiming !== tier.name) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${tier.color}40`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {claiming === tier.name ? 'Claiming...' : `Claim ${tier.name} Badge`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 className="home-title">NFT Treasury Membership</h1>

        {/* Wallet Connection */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <ConnectButton />
        </div>

        {!isConnected ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#ccc', 
            fontSize: '1.2rem',
            margin: '3rem 0'
          }}>
            Please connect your wallet to view membership status
          </div>
        ) : (
          <>
            {/* Current Status */}
            <div style={{ 
              background: '#1f1f1f', 
              borderRadius: '12px', 
              padding: '2rem',
              margin: '2rem 0',
              border: '1px solid #333'
            }}>
              <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '1rem' }}>
                Your Status
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', color: '#ccc' }}>
                  Loading NFT data...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                  Error: {error}
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    color: '#10B981', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {nftCount} NFT{nftCount !== 1 ? 's' : ''} Owned
                  </div>
                  
                  {membershipStatus?.eligibleTier ? (
                    <div style={{ 
                      fontSize: '1.3rem', 
                      color: membershipStatus.eligibleTier.color,
                      marginBottom: '1rem'
                    }}>
                      Eligible for {membershipStatus.eligibleTier.name} Tier
                    </div>
                  ) : (
                    <div style={{ color: '#ccc', marginBottom: '1rem' }}>
                      Need at least 1 NFT to qualify for membership
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Messages */}
            {claimSuccess && (
              <div style={{
                background: '#10B981',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {claimSuccess}
              </div>
            )}

            {claimError && (
              <div style={{
                background: '#ef4444',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {claimError}
              </div>
            )}

            {/* Membership Tiers */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {MEMBERSHIP_TIERS.map((tier, index) => renderTierCard(tier, index))}
            </div>

            {/* How it works */}
            <div style={{ 
              background: '#1f1f1f', 
              borderRadius: '12px', 
              padding: '2rem',
              margin: '3rem 0',
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
                How Membership Works
              </h3>
              
              <div style={{ color: '#ccc', lineHeight: '1.6' }}>
                <p>🎯 <strong>Step 1:</strong> Purchase NFTs from our collection to increase your tier eligibility</p>
                <p>🏆 <strong>Step 2:</strong> Claim your membership badge based on your NFT ownership</p>
                <p>🎁 <strong>Step 3:</strong> Enjoy exclusive benefits and access gated features</p>
                <p>🚀 <strong>Step 4:</strong> Higher tiers unlock more perks and governance rights</p>
              </div>
            </div>

            {/* Discord Access Preview for Silver/Gold Members */}
            {isConnected && nftCount >= 3 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ 
                  color: 'white', 
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  fontSize: '1.8rem'
                }}>
                  🎉 Your Silver/Gold Benefits
                </h3>
                <DiscordAccess compact={true} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
