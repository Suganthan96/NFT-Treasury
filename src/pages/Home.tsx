import { useNavigate } from "react-router-dom";
import ChromaGrid, { ChromaItem } from "../components/NFTcard";
import BlurText from "../components/BlurText";
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

  // NFT card data
  const nftCards: ChromaItem[] = [
    {
      title: "Quarterback Edition",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg,#4F46E5,#000)",
    },
    {
      title: "Hail Mary Pass",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg,#10B981,#000)",
    },
    {
      title: "End Zone Elite",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg,#F59E0B,#000)",
    },
    {
      title: "The Line of Scrimmage",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg,#EF4444,#000)",
    },
    {
      title: "The Lombardi Trophy",
      subtitle: "NFL NFT",
      image: "/nft5.png",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg,#8B5CF6,#000)",
    },
    {
      title: "Gridiron Glory",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg,#06B6D4,#000)",
    },
    {
      title: "Touchdown Titan",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#F472B6",
      gradient: "linear-gradient(120deg,#F472B6,#000)",
    },
    {
      title: "Blitz Brigade",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#34D399",
      gradient: "linear-gradient(160deg,#34D399,#000)",
    },
    {
      title: "Pigskin Prodigy",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#FBBF24",
      gradient: "linear-gradient(200deg,#FBBF24,#000)",
    },
    {
      title: "Field General",
      subtitle: "NFL NFT",
      image: "/nft5.png",
      borderColor: "#60A5FA",
      gradient: "linear-gradient(180deg,#60A5FA,#000)",
    },
    {
      title: "Red Zone Ruler",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#A78BFA",
      gradient: "linear-gradient(140deg,#A78BFA,#000)",
    },
    {
      title: "Superbowl Star",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#F87171",
      gradient: "linear-gradient(170deg,#F87171,#000)",
    },
  ];

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <BlurText text="Welcome to NFT hub" className="home-title" animateBy="words" direction="top" />

        <ChromaGrid items={nftCards} className="nft-grid" />
      </div>
    </div>
  );
}
