import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/login/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Login />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}