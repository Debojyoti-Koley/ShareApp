import { useState } from "react";
import axios from "axios";
import PeerList from "./PeerList";

export default function StartAndStopDiscovery() {
    const [peers, setPeers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle");

    const styles = {
        container: {
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#f8f8f8",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        },
        buttonContainer: {
            display: "flex",
            gap: "10px",
            marginBottom: "1rem",
        },
        button: {
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            backgroundColor: "#007bff",
            color: "white",
            transition: "background 0.2s",
        },
        stopButton: {
            backgroundColor: "#dc3545",
        },
        status: {
            marginBottom: "1rem",
            fontSize: "14px",
            color: "#333",
        },
    };

    const startDiscovery = async () => {
        setLoading(true);
        setStatus("searching...");
        console.log("[frontend] Starting discovery...");
        try {
            console.log("[frontend] Sending start request to backend...");
            // start UDP discovery
            const res = await axios.post("http://localhost:5000/peers/start", {
                id: "dev-a",
                name: "DevA",
                port: 5000,
            });
            if (res.status === 200) {
                console.log("[frontend] waiting for 10s")
                // wait 10s for peers to broadcast
                setTimeout(async () => {
                    console.log("[frontend] Fetching peers from backend...");
                    const res = await axios.get("http://localhost:5000/peers");
                    console.log("[frontend] Peers received:", res.data.peers);
                    setPeers(res.data.peers || []);
                    setStatus("done");
                    setLoading(false);
                }, 11000);
            } else {
                console.error("[frontend] Failed to start discovery:", res.data.message);
                setStatus("error");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
            setLoading(false);
        }
    };

    const stopDiscovery = async () => {
        console.log("[frontend] Stopping discovery...");
        try {
            const res = await axios.post("http://localhost:5000/peers/stop");
            if (res.status === 200) {
                console.log("[frontend] Discovery stopped successfully.");
                setStatus("stopped");
                setPeers([]);
                setLoading(false);
            }
            else {
                console.error("[frontend] Failed to stop discovery:", res.data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={styles.container}>
            <h3>🔍 Local Peer Discovery</h3>
            <div style={styles.buttonContainer}>
                <button
                    onClick={startDiscovery}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        backgroundColor: loading ? "#6c757d" : styles.button.backgroundColor,
                    }}
                >
                    {loading ? "Searching..." : "Search to Connect"}
                </button>
                <button onClick={stopDiscovery} style={{ ...styles.button, ...styles.stopButton }}>
                    Stop
                </button>
            </div>

            <p style={styles.status}>Status: {status}</p>

            <PeerList peers={peers} />
        </div>
    );
}
