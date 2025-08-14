import { useState, useEffect } from 'react';
// import { ConnectButton } from '@rainbow-me/rainbowkit';
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
        className={`tier-card ${tier.name.toLowerCase()} ${isEligible ? 'eligible' : 'not-eligible'} ${hasOwned ? 'owned' : ''}`}
      >
        <div className="tier-card-header">
          <div className="tier-icon">{tierIcons[tier.name] || '🏆'}</div>
          <h3 className="tier-name">{tier.name} Tier</h3>
          <p className="tier-requirement">Requires {tier.minNFTs} NFTs</p>
        </div>
        
        <div className="tier-benefits">
          <h4 className="benefits-title">Benefits:</h4>
          <ul className="benefits-list">
            {tier.benefits.map((benefit, idx) => (
              <li key={idx} className="benefit-item">{benefit}</li>
            ))}
          </ul>
        </div>

        <div className="tier-actions">
          <div className={`tier-status ${hasOwned ? 'owned' : isEligible ? 'eligible' : 'not-eligible'}`}>
            Status: {hasOwned ? 'Owned ✅' : isEligible ? 'Eligible ⭐' : 'Not Eligible ❌'}
          </div>
          
          {canClaim && (
            <button
              onClick={() => handleClaimBadge(tier)}
              disabled={claiming === tier.name}
              className={`claim-badge-btn ${claiming === tier.name ? 'claiming' : ''}`}
            >
              {claiming === tier.name ? (
                <>
                  <div className="loading-spinner"></div>
                  Claiming...
                </>
              ) : (
                `Claim ${tier.name} Badge`
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page modern-bg">
      <Navbar />
      
      <div className="membership-page">
        <div className="membership-container">
          {/* Hero Section */}
          <div className="membership-hero">
            <BlurText 
              text="NFT Membership Tiers" 
              className="membership-main-title" 
              animateBy="words" 
              direction="top"
            />
            <p className="membership-subtitle">
              Unlock exclusive features and benefits based on your NFT holdings
            </p>
          </div>

          {/* Always show membership content */}
          <>
              {/* Current Status Card */}
              <div className="current-status-card">
                <div className="status-header">
                  <h3>📊 Your Current Status</h3>
                </div>
                {loading ? (
                  <div className="status-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading your NFT holdings...</span>
                  </div>
                ) : error ? (
                  <div className="status-error">
                    <div className="error-icon">❌</div>
                    <span>Error: {error}</span>
                  </div>
                ) : (
                  <div className="status-content">
                    <div className="status-grid">
                      <div className="status-item">
                        <div className="status-label">Wallet Address</div>
                        <div className="status-value">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                      </div>
                      <div className="status-item">
                        <div className="status-label">NFTs Owned</div>
                        <div className="status-value nft-count">{nftCount}</div>
                      </div>
                      {membershipStatus && (
                        <>
                          <div className="status-item">
                            <div className="status-label">Eligible Tier</div>
                            <div className="status-value tier-name">{membershipStatus.eligibleTier?.name || 'None'}</div>
                          </div>
                          <div className="status-item">
                            <div className="status-label">Can Claim Badge</div>
                            <div className={`status-value claim-status ${membershipStatus.canClaim ? 'can-claim' : 'cannot-claim'}`}>
                              {membershipStatus.canClaim ? '✅ Yes' : '❌ No'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Premium Membership Section */}
              <div className="premium-membership-section">
                <div className="premium-content">
                  <div className="premium-icon">👑</div>
                  <h2 className="premium-title">Become a Premium Member</h2>
                  <p className="premium-subtitle">
                    Join our premium membership contract for only 0.005 ETH
                  </p>

                  <div className="premium-benefits">
                    <h3>🎁 Premium Benefits Include:</h3>
                    <div className="benefits-grid">
                      <div className="benefit-item">
                        <span className="benefit-icon">⚡</span>
                        <span>Instant Gold Tier Access</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🎟️</span>
                        <span>50% VIP Discount</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🎨</span>
                        <span>Exclusive Ape NFTs</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">📦</span>
                        <span>Monthly Airdrops</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🎮</span>
                        <span>Discord VIP Channels</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">📊</span>
                        <span>Advanced Analytics</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePremiumPayment}
                    disabled={isPaying || isPending || isConfirming || !isConnected}
                    className={`premium-payment-btn ${isPaying || isPending || isConfirming || !isConnected ? 'disabled' : ''}`}
                  >
                    {isPaying || isPending ? (
                      <>
                        <div className="loading-spinner"></div>
                        Processing Payment...
                      </>
                    ) : isConfirming ? (
                      <>
                        <div className="loading-spinner"></div>
                        Confirming Transaction...
                      </>
                    ) : !isConnected ? (
                      'Connect Wallet First'
                    ) : (
                      <>
                        <span className="btn-icon">💎</span>
                        Pay 0.005 ETH - Unlock Gold Tier
                      </>
                    )}
                  </button>

                  {paymentError && (
                    <div className="payment-error">
                      <div className="error-icon">❌</div>
                      <span>Payment failed: {paymentError.message}</span>
                    </div>
                  )}

                  <div className="premium-footer">
                    <p className="contract-info">Smart Contract Payment • Instant activation • Lifetime access</p>
                    <p className="contract-address">Contract: {memAddress.slice(0, 6)}...{memAddress.slice(-4)}</p>
                  </div>
                </div>
              </div>

              {/* OR Divider */}
              <div className="section-divider">
                <span>OR</span>
              </div>

              {/* Success/Error Messages */}
              {claimSuccess && (
                <div className="message-success">
                  <div className="message-icon">✅</div>
                  <span>{claimSuccess}</span>
                </div>
              )}
              
              {claimError && (
                <div className="message-error">
                  <div className="message-icon">❌</div>
                  <span>{claimError}</span>
                </div>
              )}

              {/* Membership Tiers */}
              <div className="membership-tiers-section">
                <h2 className="tiers-title">🏆 Membership Tiers</h2>
                <div className="tiers-grid">
                  {MEMBERSHIP_TIERS.map((tier) => renderTierCard(tier))}
                </div>
              </div>

              {/* Discord Access Component */}
              <div className="discord-section">
                <h3 className="discord-title">🎮 Discord Community Access</h3>
                <DiscordAccess />
              </div>
            </>
        </div>
      </div>
    </div>
  );
}
