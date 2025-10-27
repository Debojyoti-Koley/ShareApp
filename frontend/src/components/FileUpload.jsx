import  { useState } from "react";
import axios from "axios";

export default function FileUpload({isWeb}) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle file selection
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files)); // convert FileList → Array
        setMessage("");
    };

    // Handle upload
    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("Please select at least one file to upload.");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            setUploading(true);
            setMessage("Uploading...");

            if(isWeb){
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage("✅ Files uploaded successfully!");
            console.log("Upload response:", response.data);
            }else{
                setMessage("Uploading in Local mode is not implemented yet.");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setMessage("❌ Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📤 Upload Files</h2>

            <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={styles.fileInput}
            />

            {files.length > 0 && (
                <div style={styles.fileList}>
                    <p style={styles.subtitle}>Selected Files:</p>
                    <ul style={styles.list}>
                        {files.map((file, index) => (
                            <li key={index} style={styles.listItem}>
                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                style={uploading ? styles.buttonDisabled : styles.button}
                onClick={handleUpload}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>

            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
}

const styles = {
    container: {
        border: "2px dashed #999",
        borderRadius: "12px",
        padding: "20px",
        margin: "20px auto",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center",
        backgroundColor: "#f8f8f8",
    },
    title: {
        fontSize: "20px",
        marginBottom: "10px",
    },
    fileInput: {
        display: "block",
        margin: "10px auto",
        cursor: "pointer",
    },
    fileList: {
        marginTop: "10px",
        textAlign: "left",
    },
    subtitle: {
        fontWeight: "bold",
    },
    list: {
        padding: "0",
        margin: "5px 0 15px 0",
        listStyle: "none",
    },
    listItem: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "8px",
        marginBottom: "5px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    button: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#007BFF",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background-color 0.2s ease",
    },
    buttonDisabled: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#999",
        color: "white",
        cursor: "not-allowed",
        fontWeight: "bold",
    },
    message: {
        marginTop: "12px",
        fontWeight: "500",
        color: "#333",
    },
};
