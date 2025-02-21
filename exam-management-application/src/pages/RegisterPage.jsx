import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, InputGroup, Row, Col } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // Import auth
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth function
import swal from "sweetalert";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // Add email field
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // State to store Cloudinary image URL

  const navigate = useNavigate();

  const showPasswordHandler = () => {
    setShowPassword(!showPassword);
    setPasswordType(showPassword ? "password" : "text");
  };

  const showConfirmPasswordHandler = () => {
    setShowConfirmPassword(!showConfirmPassword);
    setConfirmPasswordType(showConfirmPassword ? "password" : "text");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "smart-tuition"); // Replace with your Cloudinary upload preset
    data.append("cloud_name", "dlbvyir2f"); // Replace with your Cloudinary cloud name

    try {
      setLoading(true);
      const res = await fetch("https://api.cloudinary.com/v1_1/dlbvyir2f/image/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const uploadedImage = await res.json();
      setImageUrl(uploadedImage.secure_url); // Store the Cloudinary image URL
      setPreview(uploadedImage.secure_url); // Set preview image
      setLoading(false);
      swal("Success", "Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      swal("Error", "Image upload failed!", "error");
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
  
    
    if (password.length < 6) {
      swal("Error", "Password must be at least 6 characters!", "error");
      return;
    }
  
    if (password !== confirmPassword) {
      swal("Error", "Passwords do not match!", "error");
      return;
    }
  
    if (!imageUrl) {
      swal("Error", "Please upload a profile picture!", "error");
      return;
    }
  
    setLoading(true);
  
    try {
      // ✅ Firebase Authentication: Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // ✅ Firestore: Store User Data with UID as Document ID
      await setDoc(doc(db, "users", user.uid), { // Use setDoc instead of addDoc
        firstName,
        lastName,
        email,
        phoneNumber,
        admissionNumber,
        grade,
        profilePic: imageUrl, // Store Cloudinary Image URL
        status: "pending", // Default status
        createdAt: new Date(),
      });
  
      swal("Success", "Registration Successful! Awaiting admin approval.", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
  
      if (error.code === "auth/email-already-in-use") {
        swal("Error", "Email is already in use!", "error");
      } else if (error.code === "auth/weak-password") {
        swal("Error", "Password must be at least 6 characters!", "error");
      } else {
        swal("Error", "Registration failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <FormContainer>
      <h1>Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="fname">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="lname">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="grade">
          <Form.Label>Grade</Form.Label>
          <Form.Control
            as="select"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">Select Grade</option>
            {[...Array(13).keys()].map((g) => (
              <option key={g + 1} value={g + 1}>
                {g + 1}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="my-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={passwordType}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={showPasswordHandler} variant="secondary">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="my-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={confirmPasswordType}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={showConfirmPasswordHandler} variant="secondary">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="my-3" controlId="phoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="admissionNumber">
          <Form.Label>Class Admission Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Admission Number"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
          />
        </Form.Group>

        {/* Profile Picture Upload */}
        <Form.Group className="my-3" controlId="profilePic">
          <Form.Label>Profile Picture</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          {preview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Profile Preview"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #444",
                  display: "block",
                  margin: "10px auto",
                }}
              />
            </div>
          )}
        </Form.Group>

        <Button type="submit" className="my-3" style={{ backgroundColor: "#44b131", color: "white" }}>
          Register
        </Button>
      </Form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Row className="py-3">
          <Col>
            Have an Account?{" "}
            <Link to="/login" style={{ color: "#44b131" }}>
              Login
            </Link>
          </Col>
        </Row>
      )}
    </FormContainer>
  );
};

export default RegisterPage;