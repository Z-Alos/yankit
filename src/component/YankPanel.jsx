import React, { useState } from "react";
import axios from "axios";
import './yankit.css';

const YankPanel = () => {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [downloadOptions, setDownloadOptions] = useState("");
    const [isFetching, setIsFetching] = useState(false);

  const handleDownload = async (url, videoFormatId, videoTitle) => {
    try {
      const res = await axios.post("http://localhost:3000/api/download", { url, videoFormatId, videoTitle });
      // setDownloadLink(res.data.directDownloadURL);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Check the console.");
    }
  };

  const handleInfo = async (e) => {
    e.preventDefault()
    try {
        setDownloadOptions("");
        setIsFetching(true);
      const res = await axios.post("http://localhost:3000/api/getinfo", { url });
        // setDownloadLink(res);
        console.log(res)
        setVideoTitle(res.data.title);
        setDownloadOptions(res.data.formats);
        res.data.formats.forEach((f) => {
            console.log(`🔹 ${f.resolution} | 📁 ${f.sizeMB}`);
        });
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Check the console.");
    }
      setIsFetching(false);
  }

  return (
    <div id="center-it">
      <div id="container">
      <form id="paste-link">
      <input
        type="text"
        value={url}
        placeholder="Paste YouTube link here"
        onChange={(e) => setUrl(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button onClick={handleInfo} className="bg-blue-600 text-white px-3 py-1 rounded">
        Hit Me Baby!
      </button>
      </form>

        {isFetching && (
            <p id="is-fetching">Please Wait Deepu Mammu...</p>
        )}
      {downloadOptions && downloadOptions.length > 0 && (
          <div id="links">
          <p>Download Links:</p>
          <p id="title">Title: {videoTitle}</p>
          {downloadOptions.map((option, index) => (
              <div key={index} className="link">
              <p>📺 Quality: {option.resolution}p</p>
                  <p>📂 Size: {option.sizeMB}</p>
                  <button onClick={() => handleDownload(url, option.formatID, videoTitle)} className="bg-blue-600 text-white px-3 py-1 rounded">
                  Yoink ;)
              </button>
              </div>
          ))}
          </div>
      )}

      </div>
      </div>
  );
};

export default YankPanel;

