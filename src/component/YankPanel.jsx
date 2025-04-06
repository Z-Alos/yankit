import React, { useState } from "react";
import axios from "axios";

const YankPanel = () => {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [downloadOptions, setDownloadOptions] = useState("");

  const handleDownload = async (url, videoFormatId, videoTitle) => {
    try {
      const res = await axios.post("http://localhost:3000/api/download", { url, videoFormatId, videoTitle });
      // setDownloadLink(res.data.directDownloadURL);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Check the console.");
    }
  };

  const handleInfo = async () => {
    try {
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
  }

  return (
    <div className="p-4">
      <input
        type="text"
        value={url}
        placeholder="Paste YouTube link here"
        onChange={(e) => setUrl(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button onClick={handleInfo} className="bg-blue-600 text-white px-3 py-1 rounded">
        Get Info Baby!
      </button>

      {downloadOptions && downloadOptions.length > 0 && (
          <div className="mt-4">
          <p>🎯 Direct Links:</p>
          {downloadOptions.map((option, index) => (
              <div key={index}>
              <button onClick={() => handleDownload(url, option.formatID, videoTitle)} className="bg-blue-600 text-white px-3 py-1 rounded">
               {option.resolution}
              </button>
              </div>
          ))}
          </div>
      )}

      </div>
  );
};

export default YankPanel;

