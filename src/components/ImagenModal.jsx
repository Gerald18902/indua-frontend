import React from "react";

function ImagenModal({ isOpen, onClose, src }) {
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-3xl font-bold text-gray-700 hover:text-red-500"
        >
          &times;
        </button>

        <img
          src={src}
          alt="Vista ampliada"
          className="max-w-[90vw] max-h-[70vh] object-contain rounded mb-4"
        />

      </div>
    </div>
  );
}

export default ImagenModal;
