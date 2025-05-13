import { useNavigate } from "react-router-dom";
import "../Login.css";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the video element and set its playback speed
    const video = document.getElementById("background-video") as HTMLVideoElement;
    if (video) {
      video.playbackRate = 0.8; // Slow down the video by 20%
    }
  }, []);

  return (
    <div className="video-container">
      <video autoPlay loop muted id="background-video" className="background-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="content">
        <h1 className="title">Gated NFT Website</h1>
        <button onClick={() => navigate("/connect")} className="button">
          Login
        </button>
      </div>
    </div>
  );
}
