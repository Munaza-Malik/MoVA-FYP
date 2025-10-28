import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VehicleRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    userType: "",
    name: "",
    email: "",
    phone: "",
    plateNumber: "",
    vehicleType: "",
    brand: "",
    model: "",
    color: "",
    profileImages: [],
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  // const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { role, name, email, userType } = res.data;
        setFormData((prev) => ({
          ...prev,
          role,
          userType,
          name,
          email,
        }));
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documents") {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
} else if (name === "profileImages") {
  const selectedFiles = Array.from(files);
  setFormData((prev) => ({
    ...prev,
    profileImages: [...prev.profileImages, ...selectedFiles],
  }));
  setImagePreviews((prev) => [
    ...prev,
    ...selectedFiles.map((file) => URL.createObjectURL(file)),
  ]);
}
 else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔹 Handle Form Submission
const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};
  const phoneRegex = /^(\+92|0)?3\d{9}$/;
  const plateRegex = /^[A-Z]{2,3}-\d{3,4}$/;

  if (!phoneRegex.test(formData.phone)) {
    newErrors.phone = "Invalid Pakistani phone number.";
  }
  if (!plateRegex.test(formData.plateNumber)) {
    newErrors.plateNumber = "Invalid plate number format (e.g., ABC-123).";
  }
  if (formData.documents.length === 0) {
    newErrors.documents = "Please upload your vehicle documents.";
  }
  if (formData.profileImages.length === 0) {
    newErrors.profileImages = "Please upload at least one image.";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  try {
    const data = new FormData();
    data.append("phone", formData.phone);
    data.append("plateNumber", formData.plateNumber);
    data.append("vehicleType", formData.vehicleType);
    data.append("brand", formData.brand);
    data.append("model", formData.model);
    data.append("color", formData.color);
    formData.profileImages.forEach((file) => data.append("profileImages", file));
    formData.documents.forEach((file) => data.append("documents", file));

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // ✅ POST request to backend to actually register vehicle
    const response = await axios.post(
      "http://localhost:5000/api/vehicles/register",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Vehicle Registered Successfully:", response.data);
    navigate("/user-dashboard");
  } catch (error) {
    console.error("Upload error:", error);

    if (
      error.response &&
      error.response.data.message?.includes("plate number")
    ) {
      setErrors({ plateNumber: error.response.data.message });
    } else if (error.response && error.response.data.message) {
      setErrors({ submit: error.response.data.message });
    } else {
      setErrors({
        submit: "Error registering vehicle. Please try again.",
      });
    }
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6f8f5] p-8">
      <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl p-8 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center text-[#1A2B49] mb-6">
          Vehicle Registration
        </h1>

        {errors.submit && (
          <p className="text-red-600 font-semibold text-center mb-4">
            {errors.submit}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Image Section */}
<div>
  <h2 className="text-lg font-bold text-[#A6C76C] mb-4">
    Upload Driver / Driver's Images
  </h2>

  <div className="flex flex-wrap gap-4 justify-center">
    {imagePreviews.length > 0 ? (
      imagePreviews.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Vehicle Preview ${index}`}
          className="w-32 h-32 rounded-lg object-cover border-4 border-[#A6C76C] shadow-md"
        />
      ))
    ) : (
      <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500">
        No Images
      </div>
    )}
  </div>

  <input
    type="file"
    name="profileImages"
    accept=".png,.jpg,.jpeg"
    multiple
    onChange={handleChange}
    className="hidden"
    id="profileUpload"
  />

  <label
    htmlFor="profileUpload"
    className="cursor-pointer bg-[#A6C76C] hover:bg-[#96b963] text-white px-5 py-2 mt-3 rounded-full font-semibold shadow-md transition-all duration-300 block text-center w-fit mx-auto"
  >
    Choose Images
  </label>

  {errors.profileImages && (
    <p className="text-red-500 text-sm text-center mt-2">
      {errors.profileImages}
    </p>
  )}
</div>


          {/* User Details */}
          <div>
            <h2 className="text-lg font-bold text-[#A6C76C] mb-4">
              Your Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={
                    formData.role === "admin"
                      ? "Admin"
                      : formData.userType
                      ? formData.userType.charAt(0).toUpperCase() +
                        formData.userType.slice(1)
                      : "User"
                  }
                  className="border rounded-md p-3 bg-gray-100 cursor-not-allowed w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  className="border rounded-md p-3 bg-gray-100 cursor-not-allowed w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="border rounded-md p-3 bg-gray-100 cursor-not-allowed w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div>
            <h2 className="text-lg font-bold text-[#A6C76C] mb-4">
              Vehicle Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  placeholder="ABC-123"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                  required
                />
                {errors.plateNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.plateNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="van">Van</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g., Toyota, Honda"
                  value={formData.brand}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g., Corolla 2022"
                  value={formData.model}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="border rounded-md p-3 w-full focus:ring-2 focus:ring-[#A6C76C] outline-none"
                >
                  <option value="">Select Color</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="silver">Silver</option>
                  <option value="grey">Grey</option>
                  <option value="green">Green</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Documents */}
          <div>
            <h2 className="text-lg font-bold text-[#A6C76C] mb-4">
              Upload Documents
            </h2>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                isDragging
                  ? "border-[#A6C76C] bg-[#f9fdf5]"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                setFormData((prev) => ({
                  ...prev,
                  documents: [...prev.documents, ...files],
                }));
              }}
            >
              <input
                type="file"
                name="documents"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                multiple
                onChange={handleChange}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-gray-500 mb-2">
                  Drag & drop your files here or click to browse
                </span>
                <span className="text-sm text-gray-400">
                  png, jpg, pdf, docx accepted
                </span>
                <span className="mt-3 bg-[#A6C76C] hover:bg-[#96b963] text-white px-5 py-2 rounded-full font-semibold shadow-md transition-all duration-300">
                  Browse
                </span>
              </label>

              {formData.documents.length > 0 && (
                <div className="mt-3 text-left">
                  <p className="text-sm font-semibold text-[#A6C76C]">
                    Files selected:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {formData.documents.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {errors.documents && (
                <p className="text-red-500 text-sm mt-1">{errors.documents}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="reset"
              onClick={() =>
                setFormData({
                  role: formData.role,
                  userType: formData.userType,
                  name: formData.name,
                  email: formData.email,
                  phone: "",
                  plateNumber: "",
                  vehicleType: "",
                  brand: "",
                  model: "",
                  color: "",
                  profileImages: [],
                  documents: [],
                })
              }
              className="px-6 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-full font-semibold text-white bg-[#A6C76C] hover:bg-[#96b963] shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}