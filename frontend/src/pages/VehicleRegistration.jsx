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
    driverImages: [null, null, null],
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState(["", "", ""]);
  const [driverDetails, setDriverDetails] = useState([
    { name: "", cnic: "", phone: "" },
    { name: "", cnic: "", phone: "" },
    { name: "", cnic: "", phone: "" },
  ]);
  const [driverErrors, setDriverErrors] = useState([
    { name: "", cnic: "", phone: "" },
    { name: "", cnic: "", phone: "" },
    { name: "", cnic: "", phone: "" },
  ]);

  // Fetch profile
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "documents") {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle driver image change
  const handleDriverImageChange = (index, file) => {
    const newImages = [...formData.driverImages];
    const newPreviews = [...imagePreviews];
    newImages[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, driverImages: newImages }));
    setImagePreviews(newPreviews);
  };

  // Handle driver detail change
  const handleDriverDetailChange = (index, field, value) => {
    const updated = [...driverDetails];
    updated[index][field] = value;
    setDriverDetails(updated);

    const newErrors = [...driverErrors];
    newErrors[index][field] = "";
    setDriverErrors(newErrors);
  };

  // Validation helpers
  const phoneRegex = /^(\+92|0)?3\d{9}$/;
  const plateRegex = /^[A-Z]{2,3}-\d{3,4}$/;
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    let newDriverErrors = driverErrors.map(() => ({
      name: "",
      cnic: "",
      phone: "",
    }));

    // --- Required field checks ---
    if (!formData.phone.trim()) {
      newErrors.phone = "This field is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid format";
    }

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "This field is required";
    } else if (!plateRegex.test(formData.plateNumber)) {
      newErrors.plateNumber = "Invalid format";
    }

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = "This field is required";
    }

const uploadedDrivers = driverDetails.filter(d => d.name.trim() !== "");

// Validate minimum 1 driver
if (uploadedDrivers.length === 0) {
  newErrors.driverImages = "At least one driver is required.";
}

// Validate maximum 3 drivers
if (uploadedDrivers.length > 3) {
  newErrors.driverImages = "Maximum 3 drivers allowed.";
}


    if (formData.documents.length === 0) {
      newErrors.documents = "Please upload your vehicle documents.";
    }

// --- Driver detail validations ---
const filledDrivers = driverDetails.filter(driver => driver.name.trim() !== "");

// Check at least one driver
if (filledDrivers.length === 0) {
  newErrors.driverImages = "At least one driver is required.";
}

// Validate only filled drivers
filledDrivers.forEach((driver) => {
  const index = driverDetails.indexOf(driver); // original index
  if (driver.cnic && !cnicRegex.test(driver.cnic)) newDriverErrors[index].cnic = "Invalid CNIC";
  if (driver.phone && !phoneRegex.test(driver.phone)) newDriverErrors[index].phone = "Invalid phone number";
});



setErrors(newErrors);
setDriverErrors(newDriverErrors);

const hasDriverErrors = newDriverErrors.some(
  (err) => err.name || err.cnic || err.phone
);

if (Object.keys(newErrors).length > 0 || hasDriverErrors) return;

try {
  const data = new FormData();
  data.append("phone", formData.phone);
  data.append("plateNumber", formData.plateNumber);
  data.append("vehicleType", formData.vehicleType);
  data.append("brand", formData.brand);
  data.append("model", formData.model);
  data.append("color", formData.color);

// Append driver images & details
driverDetails.forEach((driver, index) => {
  if (driver.name.trim() !== "") { // only include filled drivers
    data.append("driverNames", driver.name);
    data.append("cnics", driver.cnic || "");
    data.append("driverPhones", driver.phone || "");

    if (formData.driverImages[index]) {
      data.append("driverImages", formData.driverImages[index]);
    }
  }
});





  // Append documents
  formData.documents.forEach((file) => data.append("documents", file));

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

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
  }

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
          {/* Driver Images */}
          <div>
            <h2 className="text-lg font-bold text-[#A6C76C] mb-4 text-center">
              Upload Driver / Drivers' Images
            </h2>

            <div className="flex justify-center gap-6 flex-wrap">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex flex-col items-center">
                  <label
                    htmlFor={`driverImage${index}`}
                    className="w-28 h-28 rounded-full border-4 border-[#A6C76C] flex items-center justify-center bg-gray-100 cursor-pointer hover:scale-105 transition-all shadow-md"
                  >
                    {imagePreviews[index] ? (
                      <img
                        src={imagePreviews[index]}
                        alt={`Driver ${index + 1}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                    <input
                      id={`driverImage${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files[0] &&
                        handleDriverImageChange(index, e.target.files[0])
                      }
                    />
                  </label>

                  <p className="text-sm text-gray-600 mt-2">
                    Driver {index + 1}
                  </p>

                  {imagePreviews[index] && (
                    <div className="mt-3 space-y-2 w-40">
                      <input
                        type="text"
                        placeholder="Driver Name"
                        value={driverDetails[index].name}
                        onChange={(e) =>
                          handleDriverDetailChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full text-sm focus:ring-2 focus:ring-[#A6C76C] outline-none"
                      />
                      {driverErrors[index].name && (
                        <p className="text-red-500 text-xs">
                          {driverErrors[index].name}
                        </p>
                      )}

                      <input
                        type="text"
                        placeholder="CNIC (e.g. 35202-1234567-1)"
                        value={driverDetails[index].cnic}
                        onChange={(e) =>
                          handleDriverDetailChange(
                            index,
                            "cnic",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full text-sm focus:ring-2 focus:ring-[#A6C76C] outline-none"
                      />
                      {driverErrors[index].cnic && (
                        <p className="text-red-500 text-xs">
                          {driverErrors[index].cnic}
                        </p>
                      )}

                      <input
                        type="text"
                        placeholder="Driver Phone"
                        value={driverDetails[index].phone}
                        onChange={(e) =>
                          handleDriverDetailChange(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full text-sm focus:ring-2 focus:ring-[#A6C76C] outline-none"
                      />
                      {driverErrors[index].phone && (
                        <p className="text-red-500 text-xs">
                          {driverErrors[index].phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.driverImages && (
              <p className="text-red-500 text-sm text-center mt-3">
                {errors.driverImages}
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
                  driverImages: [null, null, null],
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
