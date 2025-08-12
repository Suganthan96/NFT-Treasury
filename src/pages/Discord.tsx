import { useState } from 'react';
import Navbar from '../components/Navbar';
import DiscordAccess from '../components/DiscordAccess';
import { useAccount } from 'wagmi';
import { useMembershipNFTs } from '../hooks/useNFTCount';

export default function Discord() {
  const { isConnected } = useAccount();
  const { nftCount } = useMembershipNFTs();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c, #1a1a1a)' }}>
      <Navbar />
      
      <div style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '6rem'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          <h1 style={{ 
            color: 'white',
            fontSize: '3rem',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #5865f2, #7289da)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💬 Discord Community
          </h1>
          <p style={{ 
            color: '#ccc',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Join our exclusive Discord server for Silver and Gold members. Get access to premium channels, 
            community events, and direct communication with the team.
          </p>
        </div>

        {/* Discord Access Component */}
        <div style={{ marginBottom: '3rem' }}>
          <DiscordAccess />
        </div>

        {/* Community Features */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {/* Silver Member Benefits */}
          <div style={{
            background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🥈</div>
            <h3 style={{ marginBottom: '1rem' }}>Silver Member Channels</h3>
            <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
              <li>💬 #silver-chat</li>
              <li>📢 #silver-announcements</li>
              <li>🎮 #gaming-lounge</li>
              <li>💡 #feedback-suggestions</li>
              <li>🎁 #member-giveaways</li>
            </ul>
          </div>

          {/* Gold Member Benefits */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🥇</div>
            <h3 style={{ marginBottom: '1rem' }}>Gold Member VIP</h3>
            <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0 }}>
              <li>👑 #vip-lounge</li>
              <li>🏛️ #governance-voting</li>
              <li>🚀 #early-access</li>
              <li>💼 #team-direct-chat</li>
              <li>🎊 #exclusive-events</li>
              <li>💰 #profit-sharing</li>
            </ul>
          </div>

          {/* Community Stats */}
          <div style={{
            background: 'linear-gradient(135deg, #7289da, #5865f2)',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ marginBottom: '1rem' }}>Community Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <strong>Total Members:</strong> 1,247
              </div>
              <div>
                <strong>Silver Members:</strong> 134
              </div>
              <div>
                <strong>Gold Members:</strong> 67
              </div>
              <div>
                <strong>Active Daily:</strong> 342
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                Your NFTs: <strong>{nftCount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* How to Join Section */}
        {!isConnected && (
          <div style={{
            background: 'rgba(88, 101, 242, 0.1)',
            border: '1px solid rgba(88, 101, 242, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '3rem'
          }}>
            <h3 style={{ color: '#5865f2', marginBottom: '1rem' }}>
              Ready to Join Our Discord Community?
            </h3>
            <div style={{ color: '#ccc', marginBottom: '1.5rem' }}>
              <p><strong>Step 1:</strong> Connect your wallet</p>
              <p><strong>Step 2:</strong> Own 3+ NFTs for Silver or 5+ for Gold</p>
              <p><strong>Step 3:</strong> Claim your membership badge</p>
              <p><strong>Step 4:</strong> Join the Discord server</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          padding: '2rem',
          color: '#666',
          borderTop: '1px solid #333'
        }}>
          <p>Questions about Discord access? Reach out to our support team.</p>
          <p style={{ fontSize: '0.9rem' }}>
            Discord integration powered by BitBadges • Server ID: 1404708871964069999
          </p>
        </div>
      </div>
    </div>
  );
}
