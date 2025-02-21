import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { FaBars, FaUserAlt } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { TbLayoutGrid, TbReport } from "react-icons/tb";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase"; // Adjust the import path as needed

const SidebarUser = ({ children }) => {
  const [categories, setCategories] = useState([]); // State to store categories from Firestore
  const [menuItems, setMenuItems] = useState([
    {
      path: "/profile",
      name: "Profile",
      icon: <FaUserAlt />,
    },
    {
      path: "/quizResults",
      name: "Results",
      icon: <TbReport />,
    },
    {
      path: "/quizzes",
      name: "All Quizzes",
      icon: <MdQuiz />,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollectionRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollectionRef);
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          catId: doc.id, // Use the document ID as catId
          title: doc.data().title, // Assuming each category document has a "title" field
        }));
        setCategories(categoriesData); // Update state with fetched categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Adding categories dynamically to the menu
  const updatedMenuItems = [
    ...menuItems,
    ...categories.map((category) => ({
      path: `/quiz/cat${category.title}?catId=${category.catId}`,
      name: category.title,
      icon: <TbLayoutGrid />,
    })),
  ];

  return (
    <div
      className="container"
      style={{ display: "flex", width: "auto", margin: "0px", padding: "0px" }}
    >
      <div style={{ width: isOpen ? "12em" : "3em" }} className="sidebar">
        <div className="top_section">
          <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
            First Name
          </h1>
          <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
            <FaBars onClick={toggle} />
          </div>
        </div>
        {updatedMenuItems.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="sidemenulink"
            activeclassname="sidemenulink-active"
          >
            <div className="icon">{item.icon}</div>
            <div
              style={{ display: isOpen ? "block" : "none" }}
              className="link_text"
            >
              {item.name}
            </div>
          </NavLink>
        ))}
      </div>
      <main>{children}</main>
    </div>
  );
};

export default SidebarUser;