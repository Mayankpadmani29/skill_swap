import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save token in localStorage
      localStorage.setItem("token", token);

      // Decode JWT to get userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem("userId", payload.id);

      // Redirect user after storing token
      navigate("/home");
    } else {
      // If no token, send to login page
      navigate("/signin");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
