import React, { useState, useEffect, useRef } from 'react';

// Message box component for displaying alerts
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg border ${bgColor} flex items-center justify-between z-50 animate-fade-in`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">X</button>
    </div>
  );
};

export default function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const geoWatchId = useRef(null); // To store the watchPosition ID for cleanup

  useEffect(() => {
    // Set up real-time geolocation tracking
    if (navigator.geolocation) {
      geoWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLoading(false);
          setMessage(''); // Clear any previous messages on successful location update
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
          let errorMessage = `Geolocation error: ${error.message}.`;
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage += " Please enable location services for this site.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage += " Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMessage += " The request to get user location timed out.";
          }
          setMessage(errorMessage);
          setMessageType('error');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0, // No caching, get fresh location
          timeout: 5000 // 5 seconds timeout
        }
      );
    } else {
      setMessage('Geolocation is not supported by your browser.');
      setMessageType('error');
      setLoading(false);
    }

    // Cleanup: Clear watchPosition when component unmounts
    return () => {
      if (geoWatchId.current) {
        navigator.geolocation.clearWatch(geoWatchId.current);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        <p className="text-xl">Loading application and trying to get your location...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4 font-inter">
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mt-8 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">
          Personal Location Viewer
        </h1>
        <p className="text-gray-600 mb-4">
          This version only displays your own location. It cannot track other users as it does not use a backend database.
        </p>

        {currentLocation ? (
          <div className="mb-6 text-gray-700">
            <p className="text-lg font-medium">Your Current Location:</p>
            <p>Latitude: {currentLocation.latitude.toFixed(5)}</p>
            <p>Longitude: {currentLocation.longitude.toFixed(5)}</p>
          </div>
        ) : (
          <div className="mb-6 text-red-500 font-medium">
            Unable to get your location. Please ensure location services are enabled and you've granted permission to this site.
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        /* Simple fade-in animation for message box */
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
