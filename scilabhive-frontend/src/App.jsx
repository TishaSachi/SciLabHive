import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import "./global.css";

// ── Global Cursor Dot ─────────────────────────────────────
function CursorDot() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let tx = 0,
      ty = 0;

    const handleMove = (e) => {
      const dot = dotRef.current;
      if (dot) {
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
      }
      tx = e.clientX;
      ty = e.clientY;
    };

    const interval = setInterval(() => {
      const ring = ringRef.current;
      if (!ring) return;
      const cx = parseFloat(ring.style.left || 0);
      const cy = parseFloat(ring.style.top || 0);
      ring.style.left = cx + (tx - cx) * 0.14 + "px";
      ring.style.top = cy + (ty - cy) * 0.14 + "px";
    }, 16);

    document.addEventListener("mousemove", handleMove);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="g-cursor-dot" />
      <div ref={ringRef} className="g-cursor-ring" />
    </>
  );
}

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <CursorDot />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
