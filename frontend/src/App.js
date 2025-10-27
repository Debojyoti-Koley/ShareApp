import './App.css';
import { useState } from 'react';
import ToggleBtn from './components/ToggleBtn';
import FileUpload from './components/FileUpload';
import FetchAndDownload from './components/FetchAndDownload';
import PeerList from './components/PeerList';

function App() {
  const [isWeb, setIsWeb] = useState(false);
  return (
    <>
      <div className="main-container">
        <h1>Welcome to ShareApp</h1>
        <div className="sharing-mode">
          <p>Select the sharing mode: </p>
          <ToggleBtn isWeb={isWeb} setIsWeb={setIsWeb} />
        </div>
        {isWeb ? <div className="web-info">
          <div className="already-uploaded">
            <h2> will show already uploaded here </h2>
            <FetchAndDownload isWeb={isWeb}/>
          </div>
          <FileUpload />
          <button className="web-send-button"> Send </button>
        </div> :
          <div className="local-info">
            {/* button for Search to connect */}
            <PeerList />
            <FileUpload />
            <button className="local-send-button"> Send </button>
            <button className="local-receive-button"> Receive </button>
          </div>
        }
      </div>
    </>
  );
}

export default App;
