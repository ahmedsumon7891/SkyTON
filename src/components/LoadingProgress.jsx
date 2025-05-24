import React from 'react';

const LoadingProgress = ({ loadingDetails }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Please wait, we are checking...</h2>
      <div className="w-full max-w-md">
        {loadingDetails.map((detail, index) => (
          <div key={index} className="flex justify-between items-center mb-2">
            <span>{detail.label}</span>
            <span>{detail.loaded ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingProgress;
