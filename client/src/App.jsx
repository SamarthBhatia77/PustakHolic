import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing            from "./pages/Landing";
import Login              from "./pages/Login";
import ReaderRegister     from "./pages/ReaderRegister";
import UserProfile        from "./pages/UserProfile";
import LibrarianRegister  from "./pages/LibrarianRegister";
import LibrarianLogin     from "./pages/LibrarianLogin";
import LibrarianProfile   from "./pages/LibrarianProfile";
import AddBook from "./pages/AddBook";
import Navbar from "./components/Navbar"
import Footer from "./components/Footer";
import AllBooks from "./pages/AllBooks";
import YourReaders from "./pages/YourReaders";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                   element={<Landing />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/register"           element={<ReaderRegister />} />
        <Route path="/profile"            element={<UserProfile />} />
        <Route path="/librarian-register" element={<LibrarianRegister />} />
        <Route path="/librarian-login"    element={<LibrarianLogin />} />
        <Route path="/librarian-profile"  element={<LibrarianProfile />} />
        <Route path="/your-readers"       element={<YourReaders />} />
        <Route path="/add-books" element={<AddBook />} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
        <Route path="/all-books" element={<AllBooks />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}