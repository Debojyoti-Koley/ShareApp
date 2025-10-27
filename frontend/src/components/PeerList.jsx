import React, { useState } from 'react';

const PeerList = () => {
    const [peers, setPeers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPeers = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:5000/peers');
            const data = await res.json();

            if (res.ok) {
                setPeers(data.peers || []);
            }
            else {
                setError(data.message || 'Failed to fetch peers');
            }
        } catch (err) {
            setError('An error occurred while fetching peers');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Nearby Devices</h2>
            <button onClick={fetchPeers} style={styles.button} disabled={loading}>
                {loading ? 'Searching...' : 'Search Peers'}
            </button>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.list}>
                {peers.length > 0 ? (
                    peers.map((peer) => (
                        <div key={peer.id} style={styles.peerCard}>
                            <strong>{peer.name}</strong>
                            <p style={styles.small}>IP: {peer.ip}</p>
                            <p style={styles.small}>Port: {peer.port}</p>
                        </div>
                    ))
                ) : (
                    !loading && <p style={styles.noPeers}>No peers found</p>
                )}
            </div>
        </div>
    );
};
const styles = {
  container: {
    maxWidth: 400,
    margin: '40px auto',
    padding: 20,
    background: '#1e1e1e',
    color: '#fff',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  title: { marginBottom: 10 },
  button: {
    background: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  error: { color: 'red', marginTop: 10 },
  list: { marginTop: 20 },
  peerCard: {
    background: '#333',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    cursor: 'pointer',
  },
  small: { fontSize: 12, color: '#aaa', margin: 0 },
  noPeers: { color: '#aaa', marginTop: 10 },
};

export default PeerList;