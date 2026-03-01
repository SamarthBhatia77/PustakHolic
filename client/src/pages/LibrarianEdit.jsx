import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LibrarianEdit.css";

export default function LibrarianEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("librarian");
    if (!stored) navigate("/librarian-login");
    else setFormData(JSON.parse(stored));
  }, [navigate]);

  if (!formData) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lUserName) {
      alert("Username cannot be empty.");
      return;
    }

    const response = await fetch("/api/librarians/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    sessionStorage.removeItem("librarian");
    navigate("/librarian-login");
  };

  return (
    <div className="edit-container">
      <h2>Edit Librarian Profile</h2>

      <form onSubmit={handleSubmit}>

        <label>
          Username <span className="required">*</span>
        </label>
        <input
          name="lUserName"
          value={formData.lUserName || ""}
          onChange={handleChange}
          placeholder="Username"
        />

        <label>
          Password
        </label>
        <input
          type="password"
          name="lPassword"
          value={formData.lPassword || ""}
          onChange={handleChange}
          placeholder="Password"
        />

        <label>Age</label>
        <input
          name="lAge"
          value={formData.lAge || ""}
          onChange={handleChange}
          placeholder="Age"
        />

        <label>Phone</label>
        <input
          name="lPhone"
          value={formData.lPhone || ""}
          onChange={handleChange}
          placeholder="Phone"
        />

        <label>Address</label>
        <input
          name="lAddress"
          value={formData.lAddress || ""}
          onChange={handleChange}
          placeholder="Address"
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}