import React, { useState, useEffect, useRef } from "react";
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
  const [imageUrl, setImageUrl] = useState(""); 
  const [capturedImages, setCapturedImages] = useState([]); 
  const [isCapturing, setIsCapturing] = useState(false);

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

    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "smart-tuition");
    data.append("cloud_name", "dlbvyir2f"); 

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
      setImageUrl(uploadedImage.secure_url); 
      setPreview(uploadedImage.secure_url);
      setLoading(false);
      swal("Success", "Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      swal("Error", "Image upload failed!", "error");
      setLoading(false);
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
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
     
      await setDoc(doc(db, "users", user.uid), { 
        firstName,
        lastName,
        email,
        phoneNumber,
        admissionNumber,
        grade,
        profilePic: imageUrl, 
        status: "pending",
        createdAt: new Date(),
      });
      sendCapturedImagesToPythonBackend(capturedImages);
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