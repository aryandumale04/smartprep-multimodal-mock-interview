import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";

const MockInterview = () => {
  const { sessionId } = useParams();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-2">
          Mock Interview
        </h1>

        <p className="text-sm text-gray-600">
          Preparing your interview for session:
          <span className="ml-1 font-medium">{sessionId}</span>
        </p>

        <div className="mt-6 p-4 border rounded text-sm text-gray-500">
          Permission checks and interview flow will start here.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
