import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaSearch,
  FaDownload,
} from "react-icons/fa";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    userType: "student",
    id: null,
  });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((u) => u.role === "user")
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.userType.toLowerCase().includes(search.toLowerCase())
    );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email")
      setErrors((prev) => ({ ...prev, email: "" }));
  };

  const validateEmail = () => {
    let errorMsg = "";
    const { email, userType } = form;

    if (userType === "student" && !email.endsWith("@students.riphah.edu.pk")) {
      errorMsg =
        "Only student emails allowed (e.g., xyz@students.riphah.edu.pk)";
    } else if (userType === "faculty" && !email.endsWith("@riphah.edu.pk")) {
      errorMsg = "Only faculty emails allowed (e.g., abc@riphah.edu.pk)";
    } else if (userType === "guest") {
      if (
        email.endsWith("@students.riphah.edu.pk") ||
        email.endsWith("@riphah.edu.pk")
      ) {
        errorMsg =
          "Guests cannot use Student/Faculty emails. Please use a personal email.";
      }
    }

    setErrors((prev) => ({ ...prev, email: errorMsg }));
    return errorMsg === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/users/${form.id}, {
          name: form.name,
          email: form.email,
          userType: form.userType,
        }`);
        setEditing(false);
      } else {
        await axios.post("http://localhost:5000/api/users", {
          name: form.name,
          email: form.email,
          userType: form.userType,
          role: "user",
          password: "123456",
        });
      }
      setForm({ name: "", email: "", userType: "student", id: null });
      fetchUsers();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email:
          err.response?.data?.message ||
          "Error saving user. Please try again.",
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      userType: user.userType || "student",
      id: user._id,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Name", "Email", "User Type"];
    const rows = filteredUsers.map((u) => [u.name, u.email, u.userType]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "users_export.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#ECF3E8] text-[#1A2B49] p-10 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-4xl font-extrabold mb-8 text-[#1A2B49] text-center">
        Manage Users
      </h1>

      {/* Form Section */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-lg border border-[#A6C76C]/30 rounded-3xl shadow-xl p-8 mb-10">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-[#1A2B49]">
          <FaUserPlus className="text-[#A6C76C]" />
          {editing ? "Edit User" : "Add New User"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-3 rounded-lg bg-white border border-[#A6C76C]/40 focus:ring-2 focus:ring-[#A6C76C] focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className={`col-span-1 md:col-span-2 p-3 rounded-lg bg-white border ${
              errors.email
                ? "border-red-400"
                : "border-[#A6C76C]/40 focus:ring-2 focus:ring-[#A6C76C]"
            } focus:outline-none`}
            required
          />
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="col-span-1 p-3 rounded-lg bg-white border border-[#A6C76C]/40 focus:ring-2 focus:ring-[#A6C76C] focus:outline-none"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="guest">Guest</option>
          </select>

          <div className="col-span-1 flex gap-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold ${
                editing
                  ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                  : "bg-[#A6C76C] hover:bg-[#96B85C] text-[#1A2B49]"
              } transition-all`}
            >
              {editing ? "Update" : "Add"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({ name: "", email: "", userType: "student", id: null });
                }}
                className="px-4 py-3 rounded-lg bg-red-500 hover:bg-red-400 text-white transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {errors.email && (
          <p className="text-red-500 text-sm mt-3">{errors.email}</p>
        )}
      </div>

      {/* Search & Export */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-5xl items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute top-3 left-3 text-[#1A2B49]/50" />
          <input
            type="text"
            placeholder="Search by name, email, or type..."
            className="w-full pl-10 p-3 rounded-lg bg-white border border-[#A6C76C]/30 focus:ring-2 focus:ring-[#A6C76C] focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#FFA500]/80 hover:bg-[#FFA500]/90 text-[#1A2B49] font-semibold shadow-md transition-all"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full max-w-5xl bg-white/90 backdrop-blur-md border border-[#A6C76C]/30 rounded-3xl shadow-lg p-6">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#1A2B49] text-white rounded-t-3xl">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">User Type</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((u, index) => (
                <tr
                  key={u._id}
                  className="border-b border-[#A6C76C]/20 hover:bg-[#A6C76C]/10 transition-all"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4 capitalize">{u.userType}</td>
                  <td className="py-3 px-4 flex justify-center gap-4 text-lg">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-yellow-500 hover:text-yellow-400 transition-transform hover:scale-110"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-500 hover:text-red-400 transition-transform hover:scale-110"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-[#1A2B49]/60 py-6 italic"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}