import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import FormContainer from "../../../components/FormContainer";
import swal from "sweetalert";
import { db } from "../../../config/firebase"; // Assuming you have this setup correctly
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore imports
import "./AdminUpdateQuiz.css";

const AdminUpdateQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();
  const quizId = params.quizId;

  // Local state to store quiz data
  const [oldQuiz, setOldQuiz] = useState({
    quizId: quizId,
    title: "",
    description: "",
    maxMarks: 50,
    numberOfQuestions: 5,
    isActive: true,
    category: { catId: 1, title: "Math" },
  });

  const [title, setTitle] = useState(oldQuiz.title);
  const [description, setDescription] = useState(oldQuiz.description);
  const [maxMarks, setMaxMarks] = useState(oldQuiz.maxMarks);
  const [numberOfQuestions, setNumberOfQuestions] = useState(oldQuiz.numberOfQuestions);
  const [isActive, setIsActive] = useState(oldQuiz.isActive);
  const [selectedCategoryId, setSelectedCategoryId] = useState(oldQuiz.category.catId);

  // Sample categories data to replace the backend call
  const [categories, setCategories] = useState([
    { catId: 1, title: "Math" },
    { catId: 2, title: "Science" },
    { catId: 3, title: "History" },
  ]);

  const onClickPublishedHandler = () => {
    setIsActive(!isActive);
  };

  const onSelectCategoryHandler = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (selectedCategoryId !== "n/a") {
      const updatedQuiz = {
        quizId: quizId,
        title: title,
        description: description,
        isActive: isActive,
        category: categories.find((cat) => cat.catId == selectedCategoryId),
      };
  
      try {
        // Update the quiz inside the correct category
        const quizRef = doc(db, "categories", selectedCategoryId, "quizzes", quizId);
        await updateDoc(quizRef, {
          title: updatedQuiz.title,
          description: updatedQuiz.description,
          isActive: updatedQuiz.isActive,
          category: updatedQuiz.category,
        });
  
        swal("Quiz Updated!", `${updatedQuiz.title} successfully updated`, "success");
        console.log("Updated Quiz: ", updatedQuiz);
        navigate("/adminQuizzes");
      } catch (error) {
        swal("Error", "Failed to update quiz", "error");
        console.error("Error updating quiz: ", error);
      }
    } else {
      swal("Error", "Please select a valid category!", "error");
    }
  };
  
  useEffect(() => {
    // Fetch quiz details from Firestore when component mounts
    const fetchQuizDetails = async () => {
      try {
        // First, fetch all categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        let quizFound = false;
    
        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryId = categoryDoc.id;
          const quizRef = doc(db, "categories", categoryId, "quizzes", quizId);
          const quizDoc = await getDoc(quizRef);
    
          if (quizDoc.exists()) {
            const quizData = quizDoc.data();
            quizFound = true;
    
            setOldQuiz({
              quizId: quizDoc.id,
              title: quizData.title || "",
              description: quizData.description || "",
              maxMarks: quizData.maxMarks || 50,
              numberOfQuestions: quizData.numberOfQuestions || 5,
              isActive: quizData.isActive ?? true,
              category: { catId: categoryId, title: categoryDoc.data().title }, // Store category
            });
    
            setTitle(quizData.title || "");
            setDescription(quizData.description || "");
            setIsActive(quizData.isActive ?? true);
            setSelectedCategoryId(categoryId);
            break;
          }
        }
    
        if (!quizFound) {
          swal("Error", "Quiz not found!", "error");
        }
      } catch (error) {
        swal("Error", "Failed to fetch quiz details", "error");
        console.error("Error fetching quiz details: ", error);
      }
    };
    
  
    fetchQuizDetails();
  }, [quizId]);
  
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
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
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
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              ></Form.Control>
            </Form.Group>

            <Form.Check
              style={{ borderColor: "rgb(68 177 49)" }}
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
                value={selectedCategoryId}
              >
                <option value="n/a">Choose Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat.catId}>
                    {cat.title}
                  </option>
                ))}
              </Form.Select>
            </div>

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
