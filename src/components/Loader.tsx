import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#fc0] mb-4"></div>
        <p className="text-gray-600 text-2xl">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
