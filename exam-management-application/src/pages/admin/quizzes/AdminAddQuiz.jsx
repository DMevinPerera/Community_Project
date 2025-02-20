import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./AdminAddQuiz.css";
import Sidebar from "../../../components/Sidebar";
import FormContainer from "../../../components/FormContainer";
import { db } from "../../../config/firebase"; 
import { collection, addDoc, getDocs } from "firebase/firestore";

const AdminAddQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        catId: doc.id,
        title: doc.data().title,
      }));
      setCategories(fetchedCategories);
    };
  
    fetchCategories();
  }, []);
  // const categories = [
  //   { catId: 1, title: "Science" },
  //   { catId: 2, title: "Math" },
  //   { catId: 3, title: "History" },
  // ];

  const navigate = useNavigate();

  const onClickPublishedHandler = () => {
    setIsActive(!isActive);
  };

  const onSelectCategoryHandler = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (selectedCategoryId !== null && selectedCategoryId !== "n/a") {
      const quiz = {
        title: title,
        description: description,
        isActive: isActive,
        categoryId: selectedCategoryId,
      };
      
      try {
        const docRef = await addDoc(collection(db, "quizzes"), quiz);
        console.log("Quiz Created with ID: ", docRef.id);
        alert("Quiz created successfully!");
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error creating quiz!");
      }
    } else {
      alert("Select valid category!");
    }
  };

  return (
    <div className="adminAddQuizPage__container">
      <div className="adminAddQuizPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminAddQuizPage__content">
        <FormContainer>
          <h2>Add Quiz</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="my-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="3"
                type="text"
                placeholder="Enter Quiz Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Check
              className="my-3"
              type="switch"
              id="publish-switch"
              label="Publish Quiz"
              onChange={onClickPublishedHandler}
              checked={isActive}
            />

            <div className="my-3">
              <label htmlFor="category-select">Choose a Category:</label>
              <Form.Select
                aria-label="Choose Category"
                id="category-select"
                onChange={onSelectCategoryHandler}
              >
                <option value="n/a">Choose Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat.catId}>
                    {cat.title}
                  </option>
                ))}
              </Form.Select>
            </div>
            <Button
              className="my-5 adminAddQuizPage__content--button"
              type="submit"
              variant="primary"
            >
              Add
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminAddQuiz;