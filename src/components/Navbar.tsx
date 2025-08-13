import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">NFT Treasury</div>
        
        <button 
          className={`navbar-hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Backdrop overlay */}
      <div 
        className={`menu-backdrop ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>

      {/* Side panel menu */}
      <div className={`hamburger-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
        <ul className="hamburger-menu-links">
          <li><Link to="/home" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/minter" onClick={closeMenu}>Minter</Link></li>
          <li><Link to="/membership" onClick={closeMenu}>Membership</Link></li>
          <li><Link to="/claims" onClick={closeMenu}>Claims</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
        </ul>
      </div>
    </>
  );
} 