import React, { useEffect } from "react";
import { Table } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import SidebarUser from "../../components/SidebarUser";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  // Static data to simulate user profile
  const user = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    phoneNumber: "123-456-7890",
    roles: [{ roleName: "Student" }],
    enabled: true,
  };

  useEffect(() => {
    // Normally, here we would fetch user data, but since it's static, no backend calls are made.
  }, []);

  return (
    <div className="userProfilePage__container">
      <div className="userProfilePage__sidebar">
        <SidebarUser />
      </div>
      {user && (
        <div className="userProfilePage__content">
          <Image
            className="userProfilePage__content--profilePic"
            width="20%"
            height="20%"
            roundedCircle
            src="images/user.png"
          />

          <Table bordered className="userProfilePage__content--table">
            <tbody>
              <tr>
                <td>Name</td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
              </tr>
              <tr>
                <td>Username</td>
                <td>{user.username}</td>
              </tr>
              <tr>
                <td>Phone</td>
                <td>{user.phoneNumber}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td>{user.roles[0].roleName}</td>
              </tr>
              <tr>
                <td>Account Status</td>
                <td>{`${user.enabled}`}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
