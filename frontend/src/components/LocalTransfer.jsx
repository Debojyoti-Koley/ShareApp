import { useState } from "react";
import axios from "axios";

export default function LocalTransfer({ connectedPeer, deviceName }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  const styles = {
    container: {
      marginTop: "1rem",
      padding: "1rem",
      border: "1px solid #ccc",
      borderRadius: "10px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    input: {
      marginTop: "0.5rem",
      display: "block",
    },
    fileList: {
      marginTop: "1rem",
      listStyleType: "none",
      padding: 0,
    },
    button: {
      marginTop: "1rem",
      padding: "8px 16px",
      border: "none",
      borderRadius: "6px",
      backgroundColor: "#007bff",
      color: "white",
      cursor: "pointer",
      fontSize: "14px",
    },
    disabledButton: {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
    progressBar: {
      height: "8px",
      borderRadius: "4px",
      backgroundColor: "#e9ecef",
      overflow: "hidden",
      marginTop: "10px",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#28a745",
      transition: "width 0.3s ease",
    },
    statusText: {
      marginTop: "8px",
      fontSize: "14px",
    },
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setUploadStatus(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!files.length || !connectedPeer) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      // include metadata
      formData.append("peerId", connectedPeer.id);
      formData.append("from", deviceName);

      const res = await axios.post("http://localhost:5000/transfer/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      if (res.status === 200) {
        setUploadStatus("✅ Transfer complete!");
        console.log("[frontend] Transfer success:", res.data);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("[frontend] Upload error:", err);
      setUploadStatus("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h4>📤 Send Files to {connectedPeer?.name}</h4>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={styles.input}
      />

      {files.length > 0 && (
        <ul style={styles.fileList}>
          {files.map((file, i) => (
            <li key={i}>
              {file.name} ({Math.round(file.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}

      {uploadProgress > 0 && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${uploadProgress}%`,
            }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!files.length || uploading}
        style={{
          ...styles.button,
          ...(uploading ? styles.disabledButton : {}),
        }}
      >
        {uploading ? "Uploading..." : "Send File(s)"}
      </button>

      {uploadStatus && <p style={styles.statusText}>{uploadStatus}</p>}
    </div>
  );
}
