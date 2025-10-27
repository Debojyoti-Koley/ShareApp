import { useState } from "react";

const ToggleBtn = ({isWeb,setIsWeb}) => {

    const toggle = () => {
        setIsWeb(!isWeb);
    };

    return (
        <div className="toggle-btn-container" style={{
            ...styles.switch,
            backgroundColor: isWeb ? "#4caf50" : "#ccc",
        }}>
            <div onClick={toggle} style={{
                ...styles.circle,
                transform: isWeb ? "translateX(24px)" : "translateX(0)",
            }}>
                <div />
            </div>
            <span className="toggle-btn-text" style={{ marginLeft: "10px", fontSize: "16px" }}>
                {isWeb ? "Web" : "Local"}
            </span>
        </div>
    );
}

export default ToggleBtn;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
  },
  switch: {
    width: "50px",
    height: "25px",
    borderRadius: "25px",
    backgroundColor: "#ccc",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  circle: {
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    backgroundColor: "white",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "transform 0.2s ease",
  },
};