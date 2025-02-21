import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import FormContainer from "../components/FormContainer";
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth function
import { auth, db } from "../config/firebase"; // Import auth and db
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

const LoginPage = () => {
  const [email, setEmail] = useState(""); // Use email instead of username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const showPasswordHandler = () => {
    setShowPassword(!showPassword);
    setPasswordType(showPassword ? "password" : "text");
  };

  // Static admin credentials
  // const staticAdminEmail = "admin@gmail.com";
  // const staticAdminPassword = "123456";

  const submitHandler = async (e) => {
    e.preventDefault();
  
    // Static admin credentials
    const staticAdminEmail = "admin@gmail.com";
    const staticAdminPassword = "123456";
  
    // Check if the entered credentials match the static admin credentials
    if (email === staticAdminEmail && password === staticAdminPassword) {
      navigate("/adminprofile"); // Redirect to admin profile
      return; // Exit the function early
    }
  
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch user data from Firestore using the UID
      const userDocRef = doc(db, "users", user.uid); // Use the user's UID
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
  
        // Check if the user is approved
        if (userData.status === "approved") {
          // Redirect based on user role or status
          navigate("/profile"); // Redirect to user profile
        } else {
          setError("Your account is not approved yet. Please contact the admin.");
          await auth.signOut(); // Log out the user if not approved
        }
      } else {
        setError("User data not found! Please contact support.");
        await auth.signOut(); // Log out the user if data is not found
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Invalid credentials or account not approved.");
    }
  };

  return (
    <FormContainer>
      <h1>Sign In</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
            <Button
              onClick={showPasswordHandler}
              variant=""
              style={{ border: "1px solid black" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button
          variant=""
          className="my-3"
          type="submit"
          style={{ backgroundColor: "rgb(68 177 49)", color: "white" }}
        >
          Login
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          New Customer?{" "}
          <Link to="/register" style={{ color: "rgb(68 177 49)" }}>
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage;