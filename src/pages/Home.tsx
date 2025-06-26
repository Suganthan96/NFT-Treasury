import { useNavigate } from "react-router-dom";
import NFTCard from "../components/NFTcard";
import "../index.css";
import { Alchemy, Network } from "alchemy-sdk";
import Navbar from "../components/Navbar";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(config);

export async function ownsAnyERC721(address: string): Promise<string[]> {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  // Filter for ERC-721 NFTs
  const erc721s = nfts.ownedNfts.filter(nft => nft.tokenType === "ERC721");
  // Return contract addresses of owned ERC-721 NFTs
  return erc721s.map(nft => nft.contract.address);
}

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/Login');
  };

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
    const contracts = await ownsAnyERC721(address);

    if (contracts.length > 0) {
      // Optionally, save the contract addresses for your use
      // localStorage.setItem("userNFTContracts", JSON.stringify(contracts));
      navigate("/home");
    } else {
      alert("You must own at least one ERC-721 NFT to log in.");
    }
  };

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <h1 className="home-title">Welcome to the NFT Hub</h1>

        <div className="nft-grid">
          <NFTCard title="Quarterback Edition" image="/nft1.png" />
          <NFTCard title="Hail Mary Pass" image="/nft2.png" />
          <NFTCard title="Hail Mary Pass" image="/nft3.png" />
          <NFTCard title="The Line of Scrimmage" image="/nft4.png" />
          <NFTCard title="The Lombardi Trophy" image="/nft5.png" />
        </div>
      </div>
    </div>
  );
}
