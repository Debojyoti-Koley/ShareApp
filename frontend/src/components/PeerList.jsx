export default function PeerList({ peers }) {
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
        connectBtn: {
            backgroundColor: "#28a745",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "14px",
        },
    };

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
                        style={styles.connectBtn}
                        onClick={() => alert(`Connecting to ${peer.name}...`)}
                    >
                        Connect
                    </button>
                </div>
            ))}
        </div>
    );
}
