import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { hasBitBadge, MEMBERSHIP_TIERS, MembershipTier } from '../utils/bitbadges';
import { useMembershipNFTs } from '../hooks/useNFTCount';

interface MembershipGatedFeatureProps {
  requiredTier: 'Bronze' | 'Silver' | 'Gold';
  children: React.ReactNode;
  featureName: string;
  showPreview?: boolean;
}

export default function MembershipGatedFeature({
  requiredTier,
  children,
  featureName,
  showPreview = false
}: MembershipGatedFeatureProps) {
  const { address, isConnected } = useAccount();
  const { nftCount } = useMembershipNFTs();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tier, setTier] = useState<MembershipTier | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const requiredTierData = MEMBERSHIP_TIERS.find(t => t.name === requiredTier);
      if (!requiredTierData) {
        setLoading(false);
        return;
      }

      setTier(requiredTierData);

      if (!isConnected || !address) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Check BitBadges first
        const hasRequiredBadge = await hasBitBadge(address, requiredTierData.collectionId, requiredTierData.badgeId);
        
        // For Gold tier, also check webhook-activated benefits
        let hasWebhookBenefits = false;
        if (requiredTier === 'Gold') {
          try {
            const response = await fetch(`http://localhost:3001/api/gold-benefits/${address}`);
            const benefitsData = await response.json();
            hasWebhookBenefits = benefitsData.hasGoldBenefits;
            console.log('🔍 Webhook Gold benefits check:', hasWebhookBenefits, 'for address:', address);
          } catch (error) {
            console.log('⚠️ Could not check webhook benefits:', error);
          }
        }
        
        // Grant access if either BitBadges OR webhook benefits are active
        const finalAccess = hasRequiredBadge || hasWebhookBenefits;
        setHasAccess(finalAccess);
        
        console.log('🎯 Access check result:', {
          requiredTier,
          address,
          bitbadges: hasRequiredBadge,
          webhook: hasWebhookBenefits,
          finalAccess
        });
        
      } catch (error) {
        console.error('Error checking badge access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [address, isConnected, requiredTier]);

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        background: '#2a2a2a',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#ccc'
      }}>
        Checking {featureName} access...
      </div>
    );
  }

  if (!hasAccess) {
    const isEligible = tier && nftCount >= tier.minNFTs;
    
    return (
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
        borderRadius: '12px',
        border: tier ? `2px solid ${tier.color}40` : '2px solid #555',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Locked overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ margin: '0 0 1rem 0', color: tier?.color || '#ccc' }}>
              {requiredTier} Members Only
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#ccc' }}>
              {featureName} requires {requiredTier} membership
            </p>
            
            {!isConnected ? (
              <p style={{ color: '#F59E0B' }}>Connect your wallet to check eligibility</p>
            ) : isEligible ? (
              <div>
                <p style={{ color: '#10B981', marginBottom: '1rem' }}>
                  ✅ You're eligible! You own {nftCount} NFT{nftCount !== 1 ? 's' : ''}
                </p>
                <a 
                  href="/membership" 
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: `linear-gradient(135deg, ${tier?.color}, ${tier?.color}CC)`,
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  Claim {requiredTier} Badge
                </a>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
                  Need {tier?.minNFTs || 1} NFT{(tier?.minNFTs || 1) !== 1 ? 's' : ''} (you have {nftCount})
                </p>
                <a 
                  href="/home" 
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #4F46E5, #3730A3)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  Buy More NFTs
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Preview content (blurred) */}
        {showPreview && (
          <div style={{ filter: 'blur(3px)', opacity: 0.3 }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
