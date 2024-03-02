import React, { useState, useEffect } from "react";

const DetailedImage = () => {
  const [imageData, setImageData] = useState([]);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    fetchImageData();
  }, [timestamp]);

  const fetchImageData = () => {
    fetch(`http://localhost:5000/serve-all-files?t=${timestamp}`)
      .then((response) => response.json())
      .then((data) => {
        const fileData = data.files.map((path) => {
          const fileName = path.split("/").pop();
          return { path, fileName };
        });
        fileData.sort((a, b) => a.fileName.localeCompare(b.fileName));
        setImageData(fileData);
      })
      .catch((error) => {
        console.error("Error fetching image paths:", error);
      });
  };

  const handleRefresh = () => {
    setTimestamp(Date.now());
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>All Images</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <div>
        {imageData.map((item, index) => (
          <div
            key={index}
            style={{ marginBottom: "20px", textAlign: "center" }}
          >
            <img
              src={`http://localhost:5000/serve-files/${
                item.fileName
              }?t=${Date.now()}`}
              alt={`Image ${index}`}
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
              {item.fileName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedImage;
