import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReaderEdit.css";

export default function ReaderEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("reader");
    if (!stored) navigate("/login");
    else setFormData(JSON.parse(stored));
  }, [navigate]);

  if (!formData) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rUserName) {
      alert("Username cannot be empty.");
      return;
    }

    const response = await fetch("/api/readers/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    sessionStorage.removeItem("reader");
    navigate("/login");
  };

  return (
    <div className="edit-container">
      <h2>Edit Reader Profile</h2>

      <form onSubmit={handleSubmit}>

        <label>
          Username <span className="required">*</span>
        </label>
        <input
          name="rUserName"
          value={formData.rUserName || ""}
          onChange={handleChange}
          placeholder="Username"
        />

        <label>
          Password
        </label>
        <input
          type="password"
          name="rPassword"
          value={formData.rPassword || ""}
          onChange={handleChange}
          placeholder="Password"
        />

        <label>Age</label>
        <input
          name="rAge"
          value={formData.rAge || ""}
          onChange={handleChange}
          placeholder="Age"
        />

        <label>Address</label>
        <input
          name="rAddress"
          value={formData.rAddress || ""}
          onChange={handleChange}
          placeholder="Address"
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}