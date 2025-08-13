import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import Navbar from '../components/Navbar';
import BlurText from '../components/BlurText';
import DiscordAccess from '../components/DiscordAccess';
import { useMembershipNFTs } from '../hooks/useNFTCount';
import memAbi from '../abi/memAbi.json';
import { memAddress } from '../constants/mem';
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
  const [isPaying, setIsPaying] = useState(false);

  // Premium membership payment hooks using smart contract
  const { writeContract, data: hash, isPending, error: paymentError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle premium membership payment using smart contract
  const handlePremiumPayment = () => {
    if (!address) return;
    
    setIsPaying(true);
    writeContract({
      address: memAddress as `0x${string}`,
      abi: memAbi,
      functionName: 'joinNow',
      value: parseEther('0.005')
    });
  };

  // Handle payment success
  useEffect(() => {
    if (isConfirmed) {
      setIsPaying(false);
      setClaimSuccess('🎉 Premium membership contract executed! You paid 0.005 ETH and now have Gold tier access!');
      // Refresh membership status
      if (address) {
        getUserMembershipStatus(address, nftCount).then(setMembershipStatus);
      }
    }
  }, [isConfirmed, address, nftCount]);

  // Handle payment error
  useEffect(() => {
    if (paymentError) {
      setIsPaying(false);
      setClaimError(`Payment failed: ${paymentError.message}`);
    }
  }, [paymentError]);

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

  const renderTierCard = (tier: MembershipTier) => {
    const isEligible = nftCount >= tier.minNFTs;
    const hasOwned = membershipStatus?.ownedBadges[tier.name] || false;
    const canClaim = isEligible && !hasOwned;

    // Define tier icons
    const tierIcons: { [key: string]: string } = {
      'Bronze': '🥉',
      'Silver': '🥈', 
      'Gold': '🥇'
    };

    return (
      <div
        key={tier.name}
        style={{
          background: isEligible 
            ? tier.name === 'Gold' 
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : tier.name === 'Silver'
              ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' 
              : 'linear-gradient(135deg, #CD7F32, #B8860B)'
            : 'linear-gradient(135deg, #4a4a4a, #2a2a2a)',
          color: isEligible ? '#000' : '#fff',
          borderRadius: '20px',
          padding: '2rem',
          border: `3px solid ${tier.color}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          marginBottom: '2rem'
        }}
        onMouseEnter={(e) => {
          if (isEligible) {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 20px 40px ${tier.color}40`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tierIcons[tier.name] || '🏆'}</div>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          {tier.name} Tier
        </h3>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.9 }}>
          Requires {tier.minNFTs} NFTs
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Benefits:</h4>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            {tier.benefits.map((benefit, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{benefit}</li>
            ))}
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            background: hasOwned ? '#22c55e' : isEligible ? '#3b82f6' : '#6b7280',
            color: 'white',
            fontWeight: 'bold'
          }}>
            Status: {hasOwned ? 'Owned ✅' : isEligible ? 'Eligible ⭐' : 'Not Eligible ❌'}
          </div>
          
          {canClaim && (
            <button
              onClick={() => handleClaimBadge(tier)}
              disabled={claiming === tier.name}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: claiming === tier.name ? 'not-allowed' : 'pointer',
                opacity: claiming === tier.name ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !claiming && (e.currentTarget.style.background = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
            >
              {claiming === tier.name ? 'Claiming...' : `Claim ${tier.name} Badge`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff'
    }}>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <BlurText 
            text="NFT Membership System" 
            className="text-4xl font-bold text-white mb-4" 
          />
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
            Unlock exclusive features based on your NFT holdings
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <ConnectButton />
          </div>

          {!isConnected && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                🔗 Connect Your Wallet
              </h3>
              <p style={{ opacity: 0.9 }}>
                Connect your wallet to check your NFT holdings and claim membership badges
              </p>
            </div>
          )}
        </div>

        {isConnected && (
          <>
            {/* Premium Membership Section */}
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '20px',
              padding: '3rem',
              marginBottom: '3rem',
              textAlign: 'center',
              border: '3px solid #FFD700',
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
                background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                animation: 'goldPulse 3s ease-in-out infinite',
                zIndex: 0
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
                <h2 style={{ 
                  color: '#000', 
                  fontSize: '2.5rem', 
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  Become a Premium Member
                </h2>
                <p style={{ 
                  color: '#333', 
                  fontSize: '1.4rem', 
                  marginBottom: '2rem',
                  fontWeight: '600'
                }}>
                  Join our premium membership contract for 0.005 ETH
                </p>

                <div style={{
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: '2px solid rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{ color: '#000', marginBottom: '1rem', fontSize: '1.5rem' }}>
                    🎁 Premium Benefits Include:
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    color: '#333',
                    fontSize: '1.1rem',
                    fontWeight: '500'
                  }}>
                    <div>⚡ Instant Gold Tier Access</div>
                    <div>🎟️ 50% VIP Discount</div>
                    <div>🎨 Exclusive Ape NFTs</div>
                    <div>📦 Monthly Airdrops</div>
                    <div>🎮 Discord VIP Channels</div>
                    <div>📊 Advanced Analytics Dashboard</div>
                  </div>
                </div>

                <button
                  onClick={handlePremiumPayment}
                  disabled={isPaying || isPending || isConfirming || !isConnected}
                  style={{
                    background: isPaying || isPending || isConfirming ? '#666' : 
                               !isConnected ? '#999' : 
                               'linear-gradient(135deg, #000, #333)',
                    color: 'white',
                    border: '3px solid #FFD700',
                    padding: '1.5rem 3rem',
                    borderRadius: '15px',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    cursor: isPaying || isPending || isConfirming || !isConnected ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '2rem',
                    minWidth: '300px'
                  }}
                  onMouseOver={(e) => !isPaying && !isPending && !isConfirming && isConnected && (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPaying || isPending ? 'Processing Payment...' :
                   isConfirming ? 'Confirming Transaction...' :
                   !isConnected ? 'Connect Wallet First' :
                   '💎 Pay 0.005 ETH - Unlock Gold Tier'}
                </button>

                {paymentError && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#EF4444',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    Payment failed: {paymentError.message}
                  </div>
                )}

                <p style={{ 
                  color: '#333', 
                  fontSize: '0.9rem', 
                  marginTop: '1rem',
                  opacity: 0.8
                }}>
                  * Smart Contract Payment • Instant activation • Lifetime access
                </p>
                
                <p style={{ 
                  color: '#666', 
                  fontSize: '0.8rem', 
                  marginTop: '0.5rem',
                  fontFamily: 'monospace'
                }}>
                  Contract: {memAddress.slice(0, 6)}...{memAddress.slice(-4)}
                </p>
              </div>
            </div>

            {/* OR divider */}
            <div style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '2rem 0',
              opacity: 0.7
            }}>
              OR
            </div>

            {/* Current Status */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>
              {loading ? (
                <div>🔄 Loading your NFT holdings...</div>
              ) : error ? (
                <div style={{ color: '#ff6b6b' }}>❌ Error: {error}</div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    📊 Your Current Status
                  </h3>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    <strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                    <strong>NFTs Owned:</strong> {nftCount}
                  </p>
                  
                  {membershipStatus && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '1.1rem' }}>
                        <strong>Eligible Tier:</strong> {membershipStatus.eligibleTier?.name || 'None'}
                      </p>
                      <p style={{ fontSize: '1.1rem' }}>
                        <strong>Can Claim New Badge:</strong> {membershipStatus.canClaim ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Success/Error Messages */}
            {claimSuccess && (
              <div style={{
                background: '#22c55e',
                color: 'white',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {claimSuccess}
              </div>
            )}
            
            {claimError && (
              <div style={{
                background: '#ef4444',
                color: 'white',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '2rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {claimError}
              </div>
            )}

            {/* Membership Tiers */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                textAlign: 'center', 
                marginBottom: '3rem',
                fontWeight: 'bold'
              }}>
                🏆 Membership Tiers
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {MEMBERSHIP_TIERS.map((tier) => renderTierCard(tier))}
              </div>
            </div>

            {/* Discord Access Component */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                fontSize: '2rem', 
                textAlign: 'center', 
                marginBottom: '2rem',
                fontWeight: 'bold'
              }}>
                🎮 Discord Community Access
              </h3>
              <DiscordAccess />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
