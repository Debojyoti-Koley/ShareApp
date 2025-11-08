import './App.css';
import { useState } from 'react';
import ToggleBtn from './components/ToggleBtn';
import FileUpload from './components/FileUpload';
import FetchAndDownload from './components/FetchAndDownload';
import StartAndStopDiscovery from './components/StartAndStopDiscovery';
import axios from "axios";

function App() {
  const [isWeb, setIsWeb] = useState(false);
  const [isReceiverMode, setIsReceiverMode] = useState(false);
  const [status, setStatus] = useState("idle");

  const styles = {
    mainContainer: {
      padding: "2rem",
      fontFamily: "sans-serif",
      textAlign: "center",
    },
    sharingMode: {
      marginBottom: "1.5rem",
    },
    section: {
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "1.5rem",
      backgroundColor: "#fdfdfd",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      margin: "1rem auto",
      maxWidth: "600px",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      margin: "10px",
      backgroundColor: "#007bff",
      color: "#fff",
    },
  };

  const startReceiverMode = async () => {
    try {
      setStatus("starting receiver...");
      const res = await axios.post("http://localhost:5000/peers/start", {
        id: "receiver-device",
        name: "Receiver",
        port: 5000,
      });
      if (res.status === 200) {
        setStatus("Receiver listening for senders...");
        setIsReceiverMode(true);
      }
    } catch (err) {
      console.error(err);
      setStatus("Receiver start failed");
    }
  };

  const stopReceiverMode = async () => {
    try {
      await axios.post("http://localhost:5000/peers/stop");
      setIsReceiverMode(false);
      setStatus("Receiver stopped");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.mainContainer}>
      <h1>Welcome to ShareApp</h1>

      <div style={styles.sharingMode}>
        <p>Select the sharing mode:</p>
        <ToggleBtn isWeb={isWeb} setIsWeb={setIsWeb} />
      </div>

      {isWeb ? (
        <div style={styles.section}>
          <h2>Uploaded Files</h2>
          <FetchAndDownload isWeb={isWeb} />
          <FileUpload isWeb={isWeb} />
        </div>
      ) : (
        <div style={styles.section}>
          {!isReceiverMode ? (
            <>
              <StartAndStopDiscovery />
              <button
                style={{ ...styles.button, backgroundColor: "#28a745" }}
                onClick={startReceiverMode}
              >
                Receive
              </button>
            </>
          ) : (
            <>
              <h3>📡 Receiver Mode Active</h3>
              <p>Status: {status}</p>
              <button
                style={{ ...styles.button, backgroundColor: "#dc3545" }}
                onClick={stopReceiverMode}
              >
                Stop Receiving
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
