import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import Logo from "./components/Logo";
import DetailedImage from "./DetailedImages";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stitchedImageSrc, setStitchedImageSrc] = useState("");
  const [matchedPointsSrc, setMatchedPointsSrc] = useState("");
  const [panoramaImageSrc, setPanoramaImageSrc] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetailedImage, setShowDetailedImage] = useState(false);
  const [detailedImageSrc, setDetailedImageSrc] = useState("");

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles([...files]);
  };

  const handleRemoveImage = (index) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles.splice(index, 1);
    setSelectedFiles(newSelectedFiles);
  };

  const clearUploads = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/clear-uploads"
      );

      if (response.status === 200) {
        toast.success(response.data.message);
      } else {
        toast.error(
          response.data.message || "Error clearing uploads. Please try again."
        );
      }
    } catch (error) {
      console.error("Error clearing uploads:", error);
      toast.error("Error clearing uploads. Please try again.");
    }
  };

  useEffect(() => {
    clearUploads();
  }, []);

  const handleUpload = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files[]", file);
      });

      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setStitchedImageSrc("");
      setMatchedPointsSrc("");
      setSelectedFiles([]);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStitch = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/stitch-opencv");
      const { matched_points_path, panorama_image_path, message } =
        response.data;

      if (response.status === 200) {
        setStitchedImageSrc("http://localhost:5000/" + panorama_image_path);
        setMatchedPointsSrc("http://localhost:5000/" + matched_points_path);
        setMessage(message);
        toast.success("Images stitched successfully!");
      } else {
        toast.error(message || "Error stitching images. Please try again.");
      }
    } catch (error) {
      console.error("Error stitching images: ", error);
      toast.error("Error stitching images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePanorama = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-panorama"
      );

      const [responseData, status] = response.data;
      const { message, results } = responseData;
      console.log("Response data from generate:", responseData);

      if (status === 200) {
        setMessage(message);

        if (results && results.panoramas && results.panoramas.length > 0) {
          setPanoramaImageSrc(
            "http://localhost:5000/serve-files/panorama_4.jpg"
          );
        } else {
          console.error("No panorama images found in results.");
        }

        toast.success("Panorama generated successfully!");
      } else {
        toast.error(message || "Error generating panorama. Please try again.");
      }
    } catch (error) {
      console.error("Error generating panorama:", error);
      toast.error("Error generating panorama. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to open the DetailedImage component
  const handleOpenDetailedImage = (src) => {
    setDetailedImageSrc(src);
    setShowDetailedImage(true);
  };

  const handleCloseDetailedImage = () => {
    setDetailedImageSrc("");
    setShowDetailedImage(false);
  };

  return (
    <div className="font-inter bg-gray-100 min-h-screen flex flex-col items-center relative overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ClipLoader color="#ffffff" loading={true} size={50} />
        </div>
      )}

      <ToastContainer />

      <div className="bg-white p-8 rounded shadow-md mb-4 max-w-lg w-full">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          Panoramer
          <Logo className="ml-4" />
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Images
          </label>
          <input
            type="file"
            id="fileInput"
            className="w-full p-2 border rounded"
            onChange={handleFileChange}
            multiple
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Uploaded Images
          </label>
          <div className="flex flex-wrap">
            {selectedFiles.map((file, index) => (
              <div key={index} className="mb-2 mr-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-500 font-medium ml-1 focus:outline-none"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded h-10 hover:bg-blue-600 focus:outline-none"
            onClick={handleUpload}
          >
            Upload
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded h-10 hover:bg-green-600 focus:outline-none"
            onClick={handleStitch}
          >
            Stitch
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded h-10 hover:bg-yellow-600 focus:outline-none"
            onClick={generatePanorama}
          >
            Panorama
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded h-10 hover:bg-red-600 focus:outline-none"
            onClick={clearUploads}
          >
            Clear Uploads
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded shadow-md mb-4 max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-4">{message}</h3>

        <div className="bg-white p-8 rounded shadow-md mb-4 max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-4">Stitched Image</h3>
          {stitchedImageSrc && (
            <>
              <img
                id="mergedImage"
                src={stitchedImageSrc}
                alt="Merged Image"
                className="w-full rounded"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded h-10 hover:bg-blue-600 focus:outline-none mt-4"
                onClick={() => handleOpenDetailedImage(stitchedImageSrc)}
              >
                Detailed Image
              </button>
            </>
          )}
        </div>

        <div className="bg-white p-8 rounded shadow-md mb-4 max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-4">Matched points</h3>
          {matchedPointsSrc && (
            <>
              <img
                id="matchedPoints"
                src={matchedPointsSrc}
                alt="Matched Points"
                className="w-full rounded"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded h-10 hover:bg-blue-600 focus:outline-none mt-4"
                onClick={() => handleOpenDetailedImage(matchedPointsSrc)}
              >
                Detailed Image
              </button>
            </>
          )}
        </div>

        <div className="bg-white p-8 rounded shadow-md mb-4 max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-4">Panorama Image</h3>
          {panoramaImageSrc && (
            <>
              <img
                id="panoramaImage"
                src={panoramaImageSrc}
                alt="Panorama Image"
                className="w-full rounded"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded h-10 hover:bg-blue-600 focus:outline-none mt-4"
                onClick={() => handleOpenDetailedImage(panoramaImageSrc)}
              >
                Detailed Image
              </button>
            </>
          )}
        </div>
      </div>

      {showDetailedImage && (
        <DetailedImage
          detailedImageSrc={detailedImageSrc}
          onClose={handleCloseDetailedImage}
        />
      )}
    </div>
  );
}

export default App;
