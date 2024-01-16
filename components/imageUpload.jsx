"use client";
import { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [lowResImage, setlowResImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setOriginalImage(null);
    setlowResImage(null);
    setProcessedImage(null); // Reset processed image when a new file is selected
    setError(null); // Reset error message
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const fileData = reader.result.split(",")[1];
      setOriginalImage(reader.result);
      try {
        // Change the URL to match your Flask server endpoint
        const response = await axios.post(
          "http://localhost:5000/upload",
          { file: fileData },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );

        if (response.data.error) {
          setError(response.data.error);
        } else if (response.data.processed_file) {
          // Convert base64 to Blob
          const byteCharacters = atob(response.data.processed_file);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          const blob = new Blob(byteArrays, { type: "image/png" });

          // Convert Blob to URL and set in the state
          const imageUrl = URL.createObjectURL(blob);
          setProcessedImage(imageUrl);

          const byteCharacters_ = atob(response.data.low_res);
          const byteArrays_ = [];
          for (let offset = 0; offset < byteCharacters_.length; offset += 512) {
            const slice = byteCharacters_.slice(offset, offset + 512);
            const byteNumbers_ = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers_[i] = slice.charCodeAt(i);
            }
            const byteArray_ = new Uint8Array(byteNumbers_);
            byteArrays_.push(byteArray_);
          }
          const blob_ = new Blob(byteArrays_, { type: "image/png" });

          // Convert Blob to URL and set in the state
          const imageUrl_ = URL.createObjectURL(blob_);
          setlowResImage(imageUrl_);
        }
      } catch (error) {
        setError("Error uploading file: " + error.message);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-[1000px] flex flex-col items-center mx-auto mt-8 p-6 bg-[#fefaee] shadow-md rounded-md">
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 mr-5 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Upload
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div>
        {lowResImage && (
          <div className="mt-4">
            <p className="font-bold text-lg">Original Image:</p>
            <img
              src={lowResImage}
              alt="Processed"
              className="mt-2 w-[256px] h-[256px] rounded-md"
            />
          </div>
        )}
      </div>
      {lowResImage && (
        <div className="text-[24px] font-bold mt-[40px]">Upscaling Process</div>
      )}
      <div className="flex gap-[40px] items-center justify-center">
        <div>
          {lowResImage && (
            <div className="mt-4 flex flex-col items-center">
              <img
                src={lowResImage}
                alt="Processed"
                className="mt-2 w-[256px] h-[256px] rounded-md"
              />
              <p className="font-bold">64 x 64 x 3</p>
            </div>
          )}
        </div>

        <div>
          {processedImage && (
            <div className="mt-4 flex flex-col items-center">
              <img
                src={processedImage}
                alt="Processed"
                className="mt-2 max-w-full rounded-md"
              />
              <p className="font-bold">256 x 256 x 3</p>
            </div>
          )}
        </div>
        <div>
          {originalImage && (
            <div className="mt-4 flex flex-col items-center">
              <img
                src={originalImage}
                alt="Processed"
                className="mt-2 max-w-full rounded-md"
              />
              <p className="font-bold">256 x 256 x 3</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
