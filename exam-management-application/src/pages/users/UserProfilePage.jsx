import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import SidebarUser from "../../components/SidebarUser";
import "./UserProfilePage.css";
import { auth, db } from "../../config/firebase"; // Import Firebase config
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser; // Get the currently logged-in user
        if (!currentUser) {
          navigate("/login"); // Redirect to login if no user is logged in
          return;
        }

        // Fetch user document from Firestore using the UID
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser(userData); // Set user data in state
        } else {
          console.error("User data not found!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  if (!user) {
    return <div>No user data found.</div>; // Handle case where user data is not available
  }

  return (
    <div className="userProfilePage__container">
      <div className="userProfilePage__sidebar">
        <SidebarUser />
      </div>
      <div className="userProfilePage__content">
        <Image
          className="userProfilePage__content--profilePic"
          width="20%"
          height="20%"
          roundedCircle
          src={user.profilePic || "images/user.png"} // Use user's profile picture or default
          alt="Profile"
        />

        <Table bordered className="userProfilePage__content--table">
          <tbody>
            <tr>
              <td>Name</td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{user.phoneNumber}</td>
            </tr>
            <tr>
              <td>Admission Number</td>
              <td>{user.admissionNumber}</td>
            </tr>
            <tr>
              <td>Grade</td>
              <td>{user.grade}</td>
            </tr>
            <tr>
              <td>Account Status</td>
              <td>{user.status}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserProfilePage;