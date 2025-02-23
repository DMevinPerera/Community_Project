import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import FormContainer from "../../../components/FormContainer";
import swal from "sweetalert";
import { db } from "../../../config/firebase";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import "./AdminUpdateQuiz.css";

const AdminUpdateQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();
  const quizId = params.quizId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numOfQuestions, setNumOfQuestions] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch categories and quiz details
  useEffect(() => {
    const fetchCategoriesAndQuiz = async () => {
      try {
        // Fetch all categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          catId: doc.id,
          title: doc.data().title,
        }));
        setCategories(categoriesData);

        // Fetch quiz details by iterating through categories
        let quizFound = false;
        for (const category of categoriesData) {
          const quizRef = doc(db, "categories", category.catId, "quizzes", quizId);
          const quizDoc = await getDoc(quizRef);

          if (quizDoc.exists()) {
            const quizData = quizDoc.data();
            quizFound = true;

            // Set quiz details
            setTitle(quizData.title);
            setDescription(quizData.description);
            setNumOfQuestions(quizData.numOfQuestions || 0);
            setIsActive(quizData.isActive ?? true);
            setSelectedCategoryId(category.catId);
            break;
          }
        }

        if (!quizFound) {
          swal("Error", "Quiz not found!", "error");
          navigate("/adminQuizzes"); // Redirect if quiz is not found
        }
      } catch (error) {
        swal("Error", "Failed to fetch quiz details", "error");
        console.error("Error fetching quiz details: ", error);
      }
    };

    fetchCategoriesAndQuiz();
  }, [quizId, navigate]);

  // Handle quiz update
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      swal("Error", "Please select a valid category!", "error");
      return;
    }

    const updatedQuiz = {
      title: title,
      description: description,
      numOfQuestions: numOfQuestions,
      isActive: isActive,
    };

    try {
      const quizRef = doc(db, "categories", selectedCategoryId, "quizzes", quizId);
      await updateDoc(quizRef, updatedQuiz);

      swal("Quiz Updated!", `${updatedQuiz.title} successfully updated`, "success");
      console.log("Updated Quiz: ", updatedQuiz);
      navigate("/adminQuizzes");
    } catch (error) {
      swal("Error", "Failed to update quiz", "error");
      console.error("Error updating quiz: ", error);
    }
  };

  return (
    <div className="adminUpdateQuizPage__container">
      <div className="adminUpdateQuizPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminUpdateQuizPage__content">
        <FormContainer>
          <h2>Update Quiz</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                placeholder="Enter Quiz Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="numOfQuestions">
              <Form.Label>Number of Questions</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Number of Questions"
                value={numOfQuestions}
                onChange={(e) => setNumOfQuestions(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Check
              className="my-3"
              type="switch"
              id="publish-switch"
              label="Publish Quiz"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />

            <Form.Group className="my-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Choose Category</option>
                {categories.map((cat) => (
                  <option key={cat.catId} value={cat.catId}>
                    {cat.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button className="my-5 adminUpdateQuizPage__content--button" type="submit" variant="primary">
              Update
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminUpdateQuiz;