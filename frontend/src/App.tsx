import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LOGIN_ROUTE } from "@/const/auth";
import Login from "@/pages/login/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={LOGIN_ROUTE} replace />} />
        <Route path={LOGIN_ROUTE} element={<Login />} />
        <Route path="*" element={<Navigate to={LOGIN_ROUTE} replace />} />
      </Routes>
    </BrowserRouter>
  );
}