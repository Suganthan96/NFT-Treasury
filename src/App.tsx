import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ConnectWallet from "./pages/WalletConnect";
import Home from "./pages/Home";
import Minter from "./pages/Minter";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/connect" element={<ConnectWallet />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Minter" element={<Minter />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Membership" element={<Membership />} />
      </Routes>
    </Router>
  );
}

export default App;
// This is the main entry point of the React application.