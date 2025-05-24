import React from 'react';
import { motion } from 'framer-motion';

const LoadingProgress = ({ loadingDetails }) => {
  // Define gradient colors for progress bars
  const gradientColors = {
    name: ['#3b82f6', '#2563eb'],      // Blue gradient
    username: ['#8b5cf6', '#6d28d9'],  // Purple gradient
    profilePic: ['#ec4899', '#db2777'], // Pink gradient
    balance: ['#10b981', '#059669']    // Green gradient
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white p-4">
      <h2 className="text-xl font-semibold mb-6">Please wait, we are checking...</h2>
      <div className="w-full max-w-md space-y-4">
        {loadingDetails.map((detail) => (
          <div key={detail.id} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{detail.label}</span>
              <span>
                {detail.status === 'success' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500 font-bold"
                  >
                    ✓
                  </motion.span>
                )}
                {detail.status === 'error' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-red-500 font-bold"
                  >
                    ✗
                  </motion.span>
                )}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${gradientColors[detail.id][0]}, ${gradientColors[detail.id][1]})`,
                  width: `${detail.progress}%`
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${detail.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingProgress;
