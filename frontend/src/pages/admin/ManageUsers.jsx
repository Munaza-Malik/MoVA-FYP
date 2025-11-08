import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaUserPlus, FaDownload, FaEye, FaEyeSlash } from "react-icons/fa";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const [userType, setUserType] = useState("student");
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    id: null,
  });

  const [studentDetails, setStudentDetails] = useState({
    faculty: "",
    programType: "",
    semester: "",
    batch: "",
    phone: "",
    sapId: "",
    year: "",
  });

  const [facultyDetails, setFacultyDetails] = useState({
    faculty: "",
    phone: "",
    sapId: "",
  });

  const [guestDetails, setGuestDetails] = useState({
    phone: "",
  });

  // Fetch users
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

  // Validation
  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.name || !formData.email) {
      newErrors.general = "Name and Email are required.";
      valid = false;
    }

    // Email validation
    if (userType === "student" && !formData.email.endsWith("@students.riphah.edu.pk")) {
      newErrors.email = "Students must use '@students.riphah.edu.pk' email.";
      valid = false;
    }
    if (userType === "faculty" && !formData.email.endsWith("@riphah.edu.pk")) {
      newErrors.email = "Faculty must use '@riphah.edu.pk' email.";
      valid = false;
    }
    if (userType === "guest") {
      if (
        formData.email.endsWith("@students.riphah.edu.pk") ||
        formData.email.endsWith("@riphah.edu.pk")
      ) {
        newErrors.email = "Guests cannot use Riphah emails.";
        valid = false;
      }
    }

    // Password (only for adding new users)
    if (!editing) {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password =
          "Password must be at least 8 chars, include uppercase, lowercase, number, and special char.";
        valid = false;
      }
    }

    // UserType-specific validation
    if (userType === "student") {
      const { faculty, programType, semester, batch, phone, sapId, year } = studentDetails;
      if (!faculty || !programType || !semester || !batch || !phone || !sapId || !year) {
        newErrors.student = "All student details are required.";
        valid = false;
      }
      if (!/^\d{5}$/.test(sapId)) {
        newErrors.student = "SAP ID must be exactly 5 digits.";
        valid = false;
      }
      if (!/^\d{11}$/.test(phone)) {
        newErrors.student = "Phone must be 11 digits.";
        valid = false;
      }
      if (!/^\d{4}$/.test(year)) {
        newErrors.student = "Year must be 4 digits.";
        valid = false;
      }
      if (!(semester >= 1 && semester <= 8)) {
        newErrors.student = "Semester must be between 1 and 8.";
        valid = false;
      }
    }

    if (userType === "faculty") {
      const { faculty, phone, sapId } = facultyDetails;
      if (!faculty || !phone || !sapId) {
        newErrors.faculty = "All faculty details are required.";
        valid = false;
      }
      if (!/^\d{4}$/.test(sapId)) {
        newErrors.faculty = "SAP ID must be exactly 4 digits.";
        valid = false;
      }
      if (!/^\d{11}$/.test(phone)) {
        newErrors.faculty = "Phone must be 11 digits.";
        valid = false;
      }
    }

    if (userType === "guest") {
      const { phone } = guestDetails;
      if (!phone || !/^\d{11}$/.test(phone)) {
        newErrors.guest = "Phone must be 11 digits.";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("email", formData.email || "");
      if (!editing) formDataToSend.append("password", formData.password || "");
      formDataToSend.append("role", "user");
      formDataToSend.append("userType", userType);

      if (userType === "student") {
        formDataToSend.append("faculty", studentDetails.faculty || "");
        formDataToSend.append("programType", studentDetails.programType || "");
        formDataToSend.append("semester", Number(studentDetails.semester) || "");
        formDataToSend.append("batch", studentDetails.batch || "");
        formDataToSend.append("year", studentDetails.year || "");
        formDataToSend.append("phone", studentDetails.phone || "");
        formDataToSend.append("sapId", studentDetails.sapId || "");
      } else if (userType === "faculty") {
        formDataToSend.append("faculty", facultyDetails.faculty || "");
        formDataToSend.append("phone", facultyDetails.phone || "");
        formDataToSend.append("sapId", facultyDetails.sapId || "");
      } else if (userType === "guest") {
        formDataToSend.append("phone", guestDetails.phone || "");
      }

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      if (editing) {
        await axios.put(`http://localhost:5000/api/users/${formData.id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditing(false);
      } else {
        await axios.post("http://localhost:5000/api/users", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({ name: "", email: "", password: "", id: null });
      setStudentDetails({
        faculty: "",
        programType: "",
        semester: "",
        batch: "",
        phone: "",
        sapId: "",
        year: "",
      });
      setFacultyDetails({ faculty: "", phone: "", sapId: "" });
      setGuestDetails({ phone: "" });
      setProfileImage(null);

      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save user.");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      id: user._id,
    });
    setUserType(user.userType || "student");
    setProfileImage(null);

    if (user.userType === "student")
      setStudentDetails({
        faculty: user.faculty,
        programType: user.programType,
        semester: user.semester,
        batch: user.batch,
        phone: user.phone,
        sapId: user.sapId,
        year: user.year,
      });
    if (user.userType === "faculty")
      setFacultyDetails({ faculty: user.faculty, phone: user.phone, sapId: user.sapId });
    if (user.userType === "guest") setGuestDetails({ phone: user.phone });

    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/users/${id}`);
    fetchUsers(); // refresh the list
  } catch (err) {
    console.error(err);
  }
};


  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "User Type",
      "Faculty",
      "Program Type",
      "Semester",
      "Batch",
      "Year",
      "Phone",
      "SAP ID",
    ];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.userType,
      u.faculty || "",
      u.programType || "",
      u.semester || "",
      u.batch || "",
      u.year || "",
      u.phone || "",
      u.sapId || "",
    ]);
    const csvContent =
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
      <h1 className="text-4xl font-extrabold mb-8 text-center">Manage Users</h1>

      {/* Form */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-lg border border-[#A6C76C]/30 rounded-3xl shadow-xl p-8 mb-10">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
          <FaUserPlus className="text-[#A6C76C]" /> {editing ? "Edit User" : "Add New User"}
        </h2>

        <div className="flex justify-center mb-4">
          {["student", "faculty", "guest"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type)}
              className={`px-6 py-2 ${
                userType === type ? "bg-[#A6C76C] text-white" : "bg-gray-200 text-gray-700"
              } ${type === "student" ? "rounded-l-full" : type === "guest" ? "rounded-r-full" : ""}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="col-span-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#A6C76C]"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="col-span-1 md:col-span-2 p-3 rounded-lg border focus:ring-2 focus:ring-[#A6C76C]"
            required
          />

          {/* Password (with toggle) */}
          {!editing && (
            <div className="relative col-span-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#A6C76C]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-[#A6C76C]"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}

          {/* Conditional Fields */}
          {userType === "student" && (
            <>
              <select
                value={studentDetails.faculty}
                onChange={(e) =>
                  setStudentDetails({ ...studentDetails, faculty: e.target.value })
                }
                className="col-span-1 p-3 rounded-lg border"
              >
                <option value="">Select Faculty</option>
                <option>Faculty of Health & Medical Sciences (FHMS)</option>
                <option>Faculty of Engineering & Applied Science (FEAS)</option>
                <option>Faculty of Computing (FC)</option>
                <option>Faculty of Social Sciences & Humanities (FSSH)</option>
                <option>Faculty of Pharmaceutical Sciences (FPS)</option>
                <option>Faculty of Management Sciences (FMS)</option>
                <option>Faculty of Rehabilitation & Allied Health Sciences (FRAHS)</option>
                <option>Faculty of Veterinary Sciences (FVS)</option>
              </select>

              <select
                value={studentDetails.programType}
                onChange={(e) =>
                  setStudentDetails({ ...studentDetails, programType: e.target.value })
                }
                className="col-span-1 p-3 rounded-lg border"
              >
                <option value="">Select Program Type</option>
                <option>Undergraduate Degree</option>
                <option>Graduate Degree</option>
                <option>Doctoral Degree</option>
                <option>Certificate/Diploma</option>
                <option>Associate Degree</option>
              </select>

              <input
                type="number"
                placeholder="Semester"
                value={studentDetails.semester}
                onChange={(e) =>
                  setStudentDetails({ ...studentDetails, semester: e.target.value })
                }
                className="col-span-1 p-3 rounded-lg border"
              />
              <select
                value={studentDetails.batch}
                onChange={(e) => setStudentDetails({ ...studentDetails, batch: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              >
                <option value="">Select Batch</option>
                <option>Spring</option>
                <option>Fall</option>
              </select>

              <input
                type="text"
                placeholder="Year"
                value={studentDetails.year}
                onChange={(e) => setStudentDetails({ ...studentDetails, year: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
              <input
                type="text"
                placeholder="Phone"
                value={studentDetails.phone}
                onChange={(e) => setStudentDetails({ ...studentDetails, phone: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
              <input
                type="text"
                placeholder="SAP ID"
                value={studentDetails.sapId}
                onChange={(e) => setStudentDetails({ ...studentDetails, sapId: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
            </>
          )}

          {userType === "faculty" && (
            <>
              <select
                value={facultyDetails.faculty}
                onChange={(e) => setFacultyDetails({ ...facultyDetails, faculty: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              >
                <option value="">Select Faculty</option>
                <option>Faculty of Health & Medical Sciences (FHMS)</option>
                <option>Faculty of Engineering & Applied Science (FEAS)</option>
                <option>Faculty of Computing (FC)</option>
                <option>Faculty of Social Sciences & Humanities (FSSH)</option>
                <option>Faculty of Pharmaceutical Sciences (FPS)</option>
                <option>Faculty of Management Sciences (FMS)</option>
                <option>Faculty of Rehabilitation & Allied Health Sciences (FRAHS)</option>
                <option>Faculty of Veterinary Sciences (FVS)</option>
              </select>

              <input
                type="text"
                placeholder="Phone"
                value={facultyDetails.phone}
                onChange={(e) => setFacultyDetails({ ...facultyDetails, phone: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
              <input
                type="text"
                placeholder="SAP ID"
                value={facultyDetails.sapId}
                onChange={(e) => setFacultyDetails({ ...facultyDetails, sapId: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
            </>
          )}

          {userType === "guest" && (
            <>
              <input
                type="text"
                placeholder="Phone"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                className="col-span-1 p-3 rounded-lg border"
              />
            </>
          )}

          <input
            type="file"
            onChange={(e) => setProfileImage(e.target.files[0])}
            className="col-span-1 md:col-span-2 p-3 rounded-lg border"
          />

          <div className="col-span-1 flex gap-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold ${
                editing ? "bg-yellow-400 text-black" : "bg-[#A6C76C] text-[#1A2B49]"
              }`}
            >
              {editing ? "Update" : "Add"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({ name: "", email: "", password: "", id: null });
                  setStudentDetails({
                    faculty: "",
                    programType: "",
                    semester: "",
                    batch: "",
                    phone: "",
                    sapId: "",
                    year: "",
                  });
                  setFacultyDetails({ faculty: "", phone: "", sapId: "" });
                  setGuestDetails({ phone: "" });
                  setProfileImage(null);
                }}
                className="px-4 py-3 rounded-lg bg-red-500 text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {Object.values(errors).map((err, i) => (
          <p key={i} className="text-red-500 mt-2">
            {err}
          </p>
        ))}
      </div>

      {/* Search & CSV */}
      <div className="flex items-center justify-between w-full max-w-5xl mb-5">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-lg border w-1/3 focus:ring-2 focus:ring-[#A6C76C]"
        />
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-[#A6C76C] px-4 py-2 rounded-lg text-[#1A2B49] hover:bg-[#96B85C]"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto w-full max-w-5xl bg-white rounded-xl shadow-lg">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#A6C76C]/30 text-[#1A2B49]">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">SAP ID</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-[#ECF3E8]/50">
                  <td className="p-3 border">{u.name}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.userType}</td>
                  <td className="p-3 border">{u.phone || "-"}</td>
                  <td className="p-3 border">{u.sapId || "-"}</td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-400 hover:bg-yellow-300 px-3 py-1 rounded text-black"
                    >
                      <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(u._id)}
                        className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-white"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center">
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
