import './App.css';
import { useState } from 'react';
import ToggleBtn from './components/ToggleBtn';
import FileUpload from './components/FileUpload';
import FetchAndDownload from './components/FetchAndDownload';
import StartAndStopDiscovery from './components/StartAndStopDiscovery';


function App() {
  const [isWeb, setIsWeb] = useState(false);

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
          <FileUpload />
          <button style={styles.button}>Send</button>
        </div>
      ) : (
        <div style={styles.section}>
          <StartAndStopDiscovery />
          {/* <FileUpload /> */}
          <button style={styles.button}>Send</button>
          <button style={{ ...styles.button, backgroundColor: "#28a745" }}>Receive</button>
        </div>
      )}
    </div>
  );
}

export default App;
