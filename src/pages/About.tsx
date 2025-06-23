import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <h1 className="home-title">About NFT Hub</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: 700, margin: '2rem auto', color: '#eee', textAlign: 'center' }}>
          <b>NFT Hub</b> is a next-generation platform designed for NFT collectors, creators, and enthusiasts. Our mission is to make NFT management, discovery, and creation accessible and enjoyable for everyone.<br /><br />

          <b>Key Features:</b><br />
          <ul style={{ textAlign: 'left', margin: '1rem auto', maxWidth: 600, color: '#eee', fontSize: '1.1rem' }}>
            <li><b>Wallet Connection:</b> Securely connect your Ethereum wallet to access personalized features and manage your NFTs.</li>
            <li><b>NFT Ownership Verification:</b> Instantly check if your wallet holds any ERC-721 NFTs using the Alchemy API, ensuring a seamless and secure login experience.</li>
            <li><b>Membership System:</b> Become a premium member by sending a small amount of ETH, unlocking exclusive features and rewards.</li>
            <li><b>NFT Minting:</b> Mint your own NFTs directly from the platform with a simple and intuitive interface.</li>
            <li><b>Profile Management:</b> View your profile, wallet address, and membership status in a dedicated profile section.</li>
            <li><b>Modern UI/UX:</b> Enjoy a visually appealing, responsive, and user-friendly interface with smooth navigation and engaging visuals.</li>
          </ul>

          <b>Technologies Used:</b><br />
          NFT Hub is built with <b>React</b> for the frontend, <b>ethers.js</b> for blockchain interactions, and <b>Alchemy</b> for reliable and fast NFT data. Smart contracts are written in <b>Solidity</b> and deployed on the Ethereum Sepolia testnet.<br /><br />

          <b>Our Vision:</b><br />
          We aim to empower users to explore, collect, and create NFTs with confidence. Whether you are a seasoned collector or new to the NFT space, NFT Hub provides all the tools you need in one place.<br /><br />

          <b>Get Started:</b><br />
          Connect your wallet, verify your NFT ownership, mint new NFTs, and join our growing community of NFT enthusiasts!
        </p>
      </div>
    </div>
  );
} 