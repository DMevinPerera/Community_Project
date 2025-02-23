import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import SidebarUser from "../../components/SidebarUser";
import "./UserProfilePage.css";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser; 
        if (!currentUser) {
          navigate("/login"); 
          return;
        }

        
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser(userData);
        } else {
          console.error("User data not found!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data found.</div>;
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
          src={user.profilePic || "images/user.png"} 
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