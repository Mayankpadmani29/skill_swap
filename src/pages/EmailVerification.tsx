import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const EmailVerification = () => {
  const [status, setStatus] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const verificationStatus = searchParams.get("status");

  useEffect(() => {
    if (verificationStatus === "success") {
      setStatus("✅ Email verified successfully! You can now login.");
    } else if (verificationStatus === "error") {
      setStatus("❌ Verification failed. Token may be invalid or expired.");
    } else {
      setStatus("No token provided.");
    }
  }, [verificationStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>{status}</h1>
    </div>
  );
};

export default EmailVerification;
