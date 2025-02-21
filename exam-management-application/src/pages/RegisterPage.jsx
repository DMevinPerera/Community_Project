import React, { useState, useRef, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [loading, setLoading] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [grade, setGrade] = useState("");

  const [capturedImages, setCapturedImages] = useState([]); // Array to store captured images
  const [isCapturing, setIsCapturing] = useState(false); // Flag to indicate if capturing is in progress

  const cameraRef = useRef(null);
  const videoRef = useRef(null);


  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error("Error accessing webcam: ", error);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let stream = videoRef.current.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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


    if (file) {
      setProfilePic(file);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
    }
    return null;
  };
  
  const startCapturingImages = async () => {
    setIsCapturing(true);
    const totalImages = 100;
    const images = [];
  
    for (let i = 0; i < totalImages; i++) {
      const blob = await captureImage();
      if (blob) {
        images.push(blob);
      }
    }
  
    setCapturedImages(images);

    setIsCapturing(false);
  };
  
  const sendCapturedImagesToPythonBackend = (images) => {
    setLoading(true);
  
    const formData = new FormData();
    const fullName = `${firstName} ${lastName}`;
    formData.append("name", fullName);
  
    images.forEach((blob, index) => {
      const file = new File([blob], `capturedFaceImage_${index}.jpg`, { type: "image/jpeg" });
      formData.append("images", file);
    });
  
    fetch("http://localhost:5000/register_face", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.message) {
          alert("Registration Successful!");
          navigate("/login");
        } else {
          alert("Registration Failed: " + data.error);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Error: " + error.message);
      });
  };

  const submitHandler = (e) => {

    e.preventDefault();
  

    if (password.length < 6) {
      swal("Error", "Password must be at least 6 characters!", "error");
      return;
    }
  
    if (password !== confirmPassword) {
      swal("Error", "Passwords do not match!", "error");
      return;
    }


    if (capturedImages.length < 100) {
      alert("Please capture 100 images!");
      return;
    }

    sendCapturedImagesToPythonBackend(capturedImages);


  };
  

  // const stopCamera = () => {
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach(track => track.stop());
  //     streamRef.current = null;
  //   }
  //   if (videoRef.current) {
  //     videoRef.current.srcObject = null;
  //   }
  //   setCameraActive(false);
  // };


  // useEffect(() => {
  //   return () => {
  //     stopCamera(); 
  //   };
  // }, []);

  return (
    <FormContainer>
      <h1>Sign Up</h1>
      <Form onSubmit={submitHandler}>
        {/* Form Fields */}
        <Form.Group className="my-3" controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control

            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}

          />
        </Form.Group>

        <Form.Group className="my-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={passwordType}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputGroup.Text
              style={{ cursor: "pointer" }}
              onClick={showPasswordHandler}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group className="my-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={confirmPasswordType}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputGroup.Text
              style={{ cursor: "pointer" }}
              onClick={showConfirmPasswordHandler}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group className="my-3" controlId="phoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="admissionNumber">
          <Form.Label>Admission Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter admission number"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="my-3" controlId="grade">
          <Form.Label>Grade</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </Form.Group>

        {/* Webcam Capture */}
        <Form.Group className="my-3" controlId="webcamCapture">
          <Form.Label>Capture Face Images (100 images)</Form.Label>
          <div className="camera-container">
            <video
              ref={videoRef}
              width="100%"
              height="auto"
              autoPlay
              muted
              style={{
                borderRadius: "8px",
                objectFit: "cover",
                border: "2px solid #444",
              }}
            ></video>
            <Button
              onClick={startCapturingImages}
              className="my-3"
              disabled={isCapturing}
            >
              {isCapturing ? "Capturing..." : "Capture Images"}
            </Button>
          </div>
          <div className="mt-3">
            <h5>Captured Images: {capturedImages.length} / 100</h5>
          </div>
        </Form.Group>

        {/* Profile Picture Upload */}
        <Form.Group className="my-3" controlId="profilePic">
          <Form.Label>Upload Profile Picture</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Form.Group>

        {/* Submit Button */}
        <Button
          type="submit"
          className="my-3"
          style={{ backgroundColor: "#44b131", color: "white" }}
        >
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