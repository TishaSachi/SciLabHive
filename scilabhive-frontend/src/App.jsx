import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Experiments from "./pages/Experiments";
import ExperimentDetail from "./pages/ExperimentDetail";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Experiments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/experiments/:id"
          element={
            <ProtectedRoute>
              <ExperimentDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
