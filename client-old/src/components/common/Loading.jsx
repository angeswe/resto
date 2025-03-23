// client/src/components/common/Loading.jsx
import React from "react";

const Loading = ({ size = "md", fullPage = false, message = "Loading..." }) => {
  // Size classes for the spinner
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  // The spinner component
  const Spinner = () => (
    <div
      className={`inline-block animate-spin rounded-full border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent ${sizeClasses[size]}`}
    ></div>
  );

  // If fullPage is true, center the spinner in the viewport
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
        <Spinner />
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    );
  }

  // Otherwise, render inline
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spinner />
      {message && <p className="mt-2 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default Loading;
