// src/components/Navbar.tsx
import React from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">NFT Gated</div>
      <ul className="nav-links">
        <li>Home</li>
        <li>About Us</li>
        <li>Membership</li>
        <li>Profile</li>
      </ul>
    </nav>
  );
};

export default Navbar;
