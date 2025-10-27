import { useEffect, useState } from "react";
import axios from "axios";

export default function FetchAndDownload() {
    const [files, setFiles] = useState([]);
    console.log("[Frontend] Component rendered");


    // Fetch all files
    useEffect(() => {
        console.log("[Frontend] Fetching files...");
        axios
            .get("http://localhost:5000/list")
            .then((res) => setFiles(res.data.files))
            .catch((err) => console.error("Error fetching files", err));
    }, []);

    // Handle download
    const handleDownload = async (id, filename) => {
        try {
            console.log(`[Frontend] Downloading file with id: ${id}`);
            const res = await axios.get(`http://localhost:5000/download/${id}`);
            const downloadUrl = res.data.downloadUrl;

            const fileResponse = await axios.get(downloadUrl, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([fileResponse.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading file:", err);
            alert("Failed to download file");
        }
    };

    const styles = {
        container: {
            maxWidth: "600px",
            margin: "50px auto",
            padding: "25px",
            backgroundColor: "#fdfdfd",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
        },
        title: {
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#333",
        },
        noFiles: {
            textAlign: "center",
            color: "#777",
            fontSize: "15px",
        },
        fileList: {
            listStyleType: "none",
            padding: 0,
            margin: 0,
        },
        fileItem: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f4f4f4",
            padding: "12px 16px",
            marginBottom: "10px",
            borderRadius: "8px",
            transition: "background-color 0.2s ease",
            cursor: "default",
        },
        fileItemHover: {
            backgroundColor: "#ebebeb",
        },
        fileName: {
            fontSize: "15px",
            color: "#333",
            wordBreak: "break-all",
        },
        downloadBtn: {
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            outline: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s ease",
        },
        downloadBtnHover: {
            backgroundColor: "#0056b3",
        },
    };

    // Custom hover effect handling
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredBtn, setHoveredBtn] = useState(null);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📁 Uploaded Files</h2>

            {files.length === 0 ? (
                <p style={styles.noFiles}>No files available.</p>
            ) : (
                <ul style={styles.fileList}>
                    {files.map((file, index) => (
                        <li
                            key={file.id}
                            style={{
                                ...styles.fileItem,
                                ...(hoveredIndex === index ? styles.fileItemHover : {}),
                            }}
                            // onMouseEnter={() => setHoveredIndex(index)}
                            // onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span style={styles.fileName}>{file.filename}</span>
                            <button
                                style={{
                                    ...styles.downloadBtn,
                                    ...(hoveredBtn === index ? styles.downloadBtnHover : {}),
                                }}
                                // onMouseEnter={() => setHoveredBtn(index)}
                                // onMouseLeave={() => setHoveredBtn(null)}
                                onClick={() => handleDownload(file.id, file.filename)}
                            >
                                ⬇️ Download
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};