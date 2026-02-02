import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";

const MockInterview = () => {
  const { sessionId } = useParams();

  const [cameraStatus, setCameraStatus] = useState("checking"); // checking | granted | denied
  const [micStatus, setMicStatus] = useState("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request both audio and video
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // If successful, permissions are granted
        setCameraStatus("granted");
        setMicStatus("granted");

        // Stop tracks immediately (we are NOT recording yet)
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Permission error:", error);

        if (error.name === "NotAllowedError") {
          setErrorMsg(
            "Camera or microphone access was denied. Please allow permissions to continue."
          );
        } else if (error.name === "NotFoundError") {
          setErrorMsg(
            "Required camera or microphone device not found."
          );
        } else {
          setErrorMsg(
            "Unable to access camera or microphone."
          );
        }

        setCameraStatus("denied");
        setMicStatus("denied");
      }
    };

    requestPermissions();
  }, []);

  const renderStatus = (label, status) => {
    if (status === "checking") {
      return <span className="text-gray-500">Checking {label}…</span>;
    }
    if (status === "granted") {
      return <span className="text-green-600">{label} access granted</span>;
    }
    return <span className="text-rose-600">{label} access denied</span>;
  };

  const allGranted =
    cameraStatus === "granted" && micStatus === "granted";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-xl font-semibold mb-2">
          Mock Interview
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Preparing your interview for session:
          <span className="ml-1 font-medium">{sessionId}</span>
        </p>

        <div className="p-4 border rounded space-y-3 text-sm">
          <div>{renderStatus("Camera", cameraStatus)}</div>
          <div>{renderStatus("Microphone", micStatus)}</div>

          {errorMsg && (
            <p className="text-rose-600 mt-3">
              {errorMsg}
            </p>
          )}

          {allGranted && (
            <p className="text-green-700 font-medium mt-4">
              All permissions granted. Ready to start interview.
            </p>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Interview will begin automatically once permissions are verified.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
