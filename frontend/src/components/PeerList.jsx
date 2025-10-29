import { useState } from "react";

export default function PeerList({ peers }) {
    const [status, setStatus] = useState({}); // { peerId: "connecting" | "connected" | "failed" }

    const styles = {
        container: {
            marginTop: "1rem",
        },
        peerItem: {
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "8px",
            backgroundColor: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        connectBtn: (peerId) => ({
            backgroundColor:
                status[peerId] === "connected"
                    ? "#28a745"
                    : status[peerId] === "connecting"
                        ? "#ffc107"
                        : "#007bff",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            padding: "6px 12px",
            cursor: status[peerId] === "connecting" ? "wait" : "pointer",
            fontSize: "14px",
            minWidth: "100px",
        }),
    };

    async function handleConnect(peerId, peerName) {
        try {
            setStatus((prev) => ({ ...prev, [peerId]: "connecting" }));

            const res = await fetch("http://localhost:5000/peers/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peerId }),
            });

            if (res.ok) {
                setStatus((prev) => ({ ...prev, [peerId]: "connected" }));
                console.log(`Connected to peer ${peerName}`);
            } else {
                throw new Error("Failed to connect");
            }
        } catch (err) {
            console.error(`Error connecting to ${peerName}:`, err);
            setStatus((prev) => ({ ...prev, [peerId]: "failed" }));
        }
    }

    if (!peers || peers.length === 0)
        return <p style={{ marginTop: "1rem", color: "#555" }}>No peers found yet.</p>;

    return (
        <div style={styles.container}>
            <h4>Available Peers:</h4>
            {peers.map((peer) => (
                <div key={peer.id} style={styles.peerItem}>
                    <div>
                        <strong>{peer.name}</strong> — {peer.ip}:{peer.port}
                    </div>
                    <button
                        style={styles.connectBtn(peer.id)}
                        onClick={() => handleConnect(peer.id, peer.name)}
                        disabled={status[peer.id] === "connecting"}
                    >
                        {status[peer.id] === "connected"
                            ? "Connected"
                            : status[peer.id] === "connecting"
                                ? "Connecting..."
                                : "Connect"}
                    </button>
                </div>
            ))}
        </div>
    );
}
