import React, { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import sideImage from "../assets/side-car.jpg";
import logo from "../assets/logo.png";
// import "./scrollbar.css"; // hidden scrollbar

export default function Signup() {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [studentDetails, setStudentDetails] = useState({
    faculty: "",
    programType: "",
    semester: "",
    batch: "",
    phone: "",
    sapId: "",
  });

  const [facultyDetails, setFacultyDetails] = useState({
    faculty: "",
    phone: "",
    sapId: "",
  });

  const [guestDetails, setGuestDetails] = useState({
    phone: "",
  });

  const [errors, setErrors] = useState({});

  // Auto-fetch SAP ID from email prefix
  useEffect(() => {
    const emailPrefix = formData.email.split("@")[0];
    if (userType === "student" && /^\d{5}$/.test(emailPrefix)) {
      setStudentDetails((s) => ({ ...s, sapId: emailPrefix }));
    } else if (userType === "faculty" && /^\d{4}$/.test(emailPrefix)) {
      setFacultyDetails((f) => ({ ...f, sapId: emailPrefix }));
    }
  }, [formData.email, userType]);

  //  Validation
  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      newErrors.general = "All fields are required.";
      valid = false;
    }

//  Password Strength Validation
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

if (!strongPasswordRegex.test(formData.password)) {
  newErrors.password =
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
  valid = false;
} else if (formData.password !== formData.confirmPassword) {
  newErrors.password = "Passwords do not match.";
  valid = false;
}


    // Email domain restriction
    if (userType === "student" && !formData.email.endsWith("@students.riphah.edu.pk")) {
      newErrors.email = "Students must use '@students.riphah.edu.pk' email.";
      valid = false;
    }

    if (userType === "faculty" && !formData.email.endsWith("@riphah.edu.pk")) {
      newErrors.email = "Faculty must use '@riphah.edu.pk' email.";
      valid = false;
    }

//  Student validation
if (userType === "student") {
  const { faculty, programType, semester, batch, phone, sapId, year } = studentDetails;

  if (!faculty || !programType || !semester || !batch || !phone || !sapId || !year) {
    newErrors.student = "All student details are required.";
    valid = false;
  }

  if (semester < 1 || semester > 8) {
    newErrors.student = "Semester must be between 1 and 8.";
    valid = false;
  }

  if (!/^\d{5}$/.test(sapId)) {
    newErrors.student = "SAP ID must be exactly 5 digits.";
    valid = false;
  }

  if (!/^\d{11}$/.test(phone)) {
    newErrors.student = "Phone number must be 11 digits.";
    valid = false;
  }

  //  Batch Year Validation (ONLY for Students)
  if (!year) {
    newErrors.student = "Batch year is required.";
    valid = false;
  } else if (!/^\d{4}$/.test(year)) {
    newErrors.student = "Year must be 4 digits (e.g., 2022).";
    valid = false;
  }
}


    //  Faculty validation
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
        newErrors.faculty = "Phone number must be 11 digits.";
        valid = false;
      }
    }

//  Guest validation
if (userType === "guest") {
  const { phone } = guestDetails;

  if (!phone) {
    newErrors.guest = "Phone number is required.";
    valid = false;
  } else if (!/^\d{11}$/.test(phone)) {
    newErrors.guest = "Phone number must be 11 digits.";
    valid = false;
  }

  //  Email validation for guest
  if (!formData.email) {
    newErrors.email = "Email is required.";
    valid = false;
  } else {
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    // Restrict Riphah student/faculty emails
    if (
      formData.email.endsWith("@students.riphah.edu.pk") ||
      formData.email.endsWith("@riphah.edu.pk")
    ) {
      newErrors.email = "Guests cannot use Riphah student or faculty emails.";
      valid = false;
    }
  }
}

    setErrors(newErrors);
    return valid;
  };


  //  Handle Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return; // run your existing frontend validation

  //  Normalize helper: convert empty strings to null
  const normalize = (val) => (val && val !== "" ? val : null);

  // Build payload based on userType
  const payload = {
    name: normalize(formData.name),
    email: normalize(formData.email),
    password: formData.password, // hashed in backend
    role: "user",
    userType,

    // Faculty & Student fields
    faculty:
      userType === "student"
        ? normalize(studentDetails.faculty)
        : userType === "faculty"
        ? normalize(facultyDetails.faculty)
        : null,

    programType: userType === "student" ? normalize(studentDetails.programType) : null,
    semester:
      userType === "student"
        ? studentDetails.semester
          ? Number(studentDetails.semester)
          : null
        : null,
    batch: userType === "student" ? normalize(studentDetails.batch) : null,

    phone:
      userType === "student"
        ? normalize(studentDetails.phone)
        : userType === "faculty"
        ? normalize(facultyDetails.phone)
        : userType === "guest"
        ? normalize(guestDetails.phone)
        : null,

    sapId:
      userType === "student"
        ? normalize(studentDetails.sapId)
        : userType === "faculty"
        ? normalize(facultyDetails.sapId)
        : null,

    year: userType === "student" ? normalize(studentDetails.year) : null,
  };

  console.log("Signup payload to send:", payload); // 🔹 Debug: verify payload

try {
  const formDataToSend = new FormData();

  //  Append text fields
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formDataToSend.append(key, payload[key]);
    }
  }

  //  Append image if exists
  if (profileImage) {
    formDataToSend.append("profileImage", profileImage);
  }

  const res = await fetch("http://localhost:5000/api/auth/signup", {
    method: "POST",
    body: formDataToSend, // no headers here (browser sets boundary automatically)
  });

  const data = await res.json();

  if (res.ok) {
    // alert(data.message);
    navigate("/login");
  } else {
    alert(data.message || "Signup failed");
  }
} catch (err) {
  console.error("Signup error:", err);
  alert("Signup failed due to server error");
}
};

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/*  Background */}
      <img
        src={sideImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-[40%_center]"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/*  Dropdown styling */}
      <style>{`
        select {
          appearance: none;
          background-color: white;
          background-image: linear-gradient(45deg, transparent 50%, #555 50%),
            linear-gradient(135deg, #555 50%, transparent 50%);
          background-position: calc(100% - 16px) center,
            calc(100% - 11px) center;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }
        select:focus {
          outline: none;
          border-color: #A6C76C;
          box-shadow: 0 0 0 2px #A6C76C33;
        }
        select option {
          color: #000;
        }
        select option[value=""] {
          color: #9ca3af;
        }
      `}</style>

      {/*  Form container */}
      <div className="relative z-10 flex justify-center items-start h-full overflow-y-auto hide-scrollbar py-10">
        <div className="bg-white/95 shadow-2xl rounded-3xl px-10 py-8 w-[90%] max-w-3xl backdrop-blur-md mt-6 mb-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-16 mb-2" />
            <p className="text-gray-600 text-sm mt-1 text-center">
              AI Multimodal Vehicle Access System
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-4">
            {["student", "faculty", "guest"].map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                type="button"
                className={`px-6 py-2 ${
                  userType === type
                    ? "bg-[#A6C76C] text-white"
                    : "bg-gray-200 text-gray-700"
                } ${
                  type === "student"
                    ? "rounded-l-full"
                    : type === "guest"
                    ? "rounded-r-full"
                    : ""
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/*  Common Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/*  Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-2">
            <label className="font-medium text-gray-700">Upload Profile Picture</label>
  
            <input
             type="file"
             accept="image/*"
             onChange={(e) => setProfileImage(e.target.files[0])}
             className="w-full border rounded-lg p-2 bg-white cursor-pointer focus:ring-2 focus:ring-[#A6C76C]"
            />

           {profileImage && (
             <img
              src={URL.createObjectURL(profileImage)}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border mt-2"
            />
              )}
          </div>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
            />
            <input
              type="email"
              placeholder={
                userType === "student"
                  ? "Email (e.g., 12345@students.riphah.edu.pk)"
                  : userType === "faculty"
                  ? "Email (e.g., 1234@riphah.edu.pk)"
                  : "Email"
              }
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
            />

            {/* Password Fields */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Password must include uppercase, lowercase, number, and special character (min 8 chars).
            </p>


            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
              </span>
            </div>

            {/*  STUDENT SECTION */}
{userType === "student" && (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <select
        value={studentDetails.faculty}
        onChange={(e) =>
          setStudentDetails({ ...studentDetails, faculty: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
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
          setStudentDetails({
            ...studentDetails,
            programType: e.target.value,
          })
        }
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="">Select Program Type</option>
        <option>Undergraduate Degree</option>
        <option>Graduate Degree</option>
        <option>Doctoral Degree</option>
        <option>Certificate/Diploma</option>
        <option>Associate Degree</option>
      </select>
    </div>

    <div className="grid grid-cols-2 gap-3">
<select
  value={studentDetails.semester}
  onChange={(e) =>
    setStudentDetails({ ...studentDetails, semester: e.target.value })
  }
  className="w-full px-3 py-2 border rounded-lg"
>
  <option value="">Select Semester</option>
  {[...Array(8)].map((_, i) => (
    <option key={i + 1} value={i + 1}>
      Semester {i + 1}
    </option>
  ))}
</select>


      <div className="grid grid-cols-2 gap-2">
        <select
          value={studentDetails.batch}
          onChange={(e) =>
            setStudentDetails({ ...studentDetails, batch: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Batch</option>
          <option>Spring</option>
          <option>Fall</option>
        </select>

        <input
          type="text"
          placeholder="Year (e.g., 2022)"
          value={studentDetails.year || ""}
          onChange={(e) =>
            setStudentDetails({
              ...studentDetails,
              year: e.target.value.replace(/\D/g, "").slice(0, 4),
            })
          }
          maxLength={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Phone Number (11 digits)"
        value={studentDetails.phone}
        onChange={(e) =>
          setStudentDetails({
            ...studentDetails,
            phone: e.target.value.replace(/\D/g, ""),
          })
        }
        maxLength={11}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
      />

      <input
        type="text"
        placeholder="SAP ID (5 digits)"
        value={studentDetails.sapId}
        onChange={(e) =>
          setStudentDetails({
            ...studentDetails,
            sapId: e.target.value.replace(/\D/g, "").slice(0, 5),
          })
        }
        maxLength={5}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
      />
    </div>
  </div>
)}


            {/*  FACULTY SECTION */}
            {userType === "faculty" && (
              <div className="space-y-3">
                <select
                  value={facultyDetails.faculty}
                  onChange={(e) =>
                    setFacultyDetails({ ...facultyDetails, faculty: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
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

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Phone Number (11 digits)"
                    value={facultyDetails.phone}
                    onChange={(e) =>
                      setFacultyDetails({
                        ...facultyDetails,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    maxLength={11}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
                  />

                  <input
                    type="text"
                    placeholder="SAP ID (4 digits)"
                    value={facultyDetails.sapId}
                    onChange={(e) =>
                      setFacultyDetails({
                        ...facultyDetails,
                        sapId: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    maxLength={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
                  />
                </div>
              </div>
            )}

            {/*  GUEST SECTION */}
            {userType === "guest" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Phone Number (11 digits)"
                  value={guestDetails.phone}
                  onChange={(e) =>
                    setGuestDetails({ phone: e.target.value.replace(/\D/g, "") })
                  }
                  maxLength={11}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A6C76C]"
                />
              </div>
            )}

            {/*  Errors */}
            {Object.values(errors).map(
              (err, i) =>
                err && (
                  <p key={i} className="text-red-500 text-sm">
                    {err}
                  </p>
                )
            )}

            {/*  Submit */}
            <button
              type="submit"
              className="w-full py-2 mt-3 bg-[#A6C76C] text-white rounded-lg font-semibold hover:bg-[#95b85e]"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}