import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login as saveToken } from "../auth/auth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      saveToken(token); // save to localStorage
      navigate("/"); // redirect to dashboard
    } else {
      navigate("/login"); // something went wrong
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
        color: "#6d6a8a",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #ddd6fe",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        Signing you in…
      </div>
    </div>
  );
}
