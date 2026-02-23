import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing            from "./pages/Landing";
import Login              from "./pages/Login";
import ReaderRegister     from "./pages/ReaderRegister";
import UserProfile        from "./pages/UserProfile";
import LibrarianRegister  from "./pages/LibrarianRegister";
import LibrarianLogin     from "./pages/LibrarianLogin";
import LibrarianProfile   from "./pages/LibrarianProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Landing />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<ReaderRegister />} />
        <Route path="/profile"            element={<UserProfile />} />
        <Route path="/librarian-register" element={<LibrarianRegister />} />
        <Route path="/librarian-login"    element={<LibrarianLogin />} />
        <Route path="/librarian-profile"  element={<LibrarianProfile />} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}