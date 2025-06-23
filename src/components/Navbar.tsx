import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">NFT Hub</div>
      <ul className="navbar-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/minter">Minter</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
} 