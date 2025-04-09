import React, { useState } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './yankit.css';
import './toast.css';

const YankPanel = () => {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [downloadOptions, setDownloadOptions] = useState("");
    const [isFetching, setIsFetching] = useState(false);

  const handleDownload = async (url, videoFormatId, videoTitle) => {
      showToast("Check Your Downloads Directory", "Downloading...");
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
      if (!url) return;

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
      <div class="toast-container"></div>
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
            <p id="is-fetching">Please Wait Buddy...</p>
        )}
      {downloadOptions && downloadOptions.length > 0 && (
          <div id="links">
          <p id="title">Title: {videoTitle}</p>
          <p id="infoText">Download Links:</p>
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

    const timeout = 5000; 

    function showToast(message, type = "success") {
        const toastContainer = document.querySelector(".toast-container");

        const toast = document.createElement("div");
        toast.classList.add("toast", type);

        toast.innerHTML = `
            <div class="toast-content">
            <i id="icon" class="bi bi-check-circle-fill"></i>
            <div class="message">
            <span class="text text-1">${capitalize(type)}</span>
            <span class="text text-2">${message}</span>
            </div>
            </div>
            <i class="bi bi-x-lg close"></i>
            <div class="progress active"></div>
            `;

        toastContainer.appendChild(toast);
        let showToast = setTimeout(() => {
            void toast.offsetHeight;
            toast.classList.add("active");
        }, 1);

        const progress = toast.querySelector(".progress");
        const closeIcon = toast.querySelector(".close");

        const timer1 = setTimeout(() => {
            toast.classList.remove("active");
        }, timeout);

        const timer2 = setTimeout(() => {
            progress.classList.remove("active");
            setTimeout(() => toast.remove(), 400);
        }, timeout + 300);

        closeIcon.addEventListener("click", () => {
            toast.classList.remove("active");
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(showToast);
            setTimeout(() => toast.remove(), 400);
        });
    }

    function getIcon(type) {
        switch (type) {
            case "success": return "check-circle-fill";
            default: return "check-circle-fill";
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


export default YankPanel;

