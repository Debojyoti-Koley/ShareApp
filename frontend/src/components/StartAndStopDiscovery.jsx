import { useState } from "react";
import axios from "axios";
import PeerList from "./PeerList";
import LocalTransfer from "./LocalTransfer"; // 👈 we'll use this next

export default function StartAndStopDiscovery() {
    const [peers, setPeers] = useState([]);
    const [connectedPeer, setConnectedPeer] = useState(null); // 👈 store connected peer
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle");

    const deviceName = "DevA"; // 👈 or make dynamic later

    const startDiscovery = async () => {
        setLoading(true);
        setStatus("searching...");
        try {
            const res = await axios.post("http://localhost:5000/peers/start", {
                id: "dev-a",
                name: deviceName,
                port: 5000,
            });

            if (res.status === 200) {
                setTimeout(async () => {
                    const res = await axios.get("http://localhost:5000/peers");
                    setPeers(res.data.peers || []);
                    setStatus("done");
                    setLoading(false);
                }, 11000);
            } else {
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
        try {
            const res = await axios.post("http://localhost:5000/peers/stop");
            if (res.status === 200) {
                setStatus("stopped");
                setPeers([]);
                setConnectedPeer(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f8f8f8" }}>
            <h3>🔍 Local Peer Discovery</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                <button
                    onClick={startDiscovery}
                    disabled={loading}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        backgroundColor: loading ? "#6c757d" : "#007bff",
                        color: "white",
                    }}
                >
                    {loading ? "Searching..." : "Search to Connect"}
                </button>
                <button
                    onClick={stopDiscovery}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "14px",
                        backgroundColor: "#dc3545",
                        color: "white",
                    }}
                >
                    Stop
                </button>
            </div>

            <p>Status: {status}</p>

            {/* 🔗 Pass callback */}
            <PeerList peers={peers} onPeerConnect={setConnectedPeer} />

            {connectedPeer && (
                <>
                    <h4>✅ Connected to {connectedPeer.name}</h4>
                    <LocalTransfer connectedPeer={connectedPeer} deviceName={deviceName} />
                </>
            )}
        </div>
    );
}
