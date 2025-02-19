import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import FormContainer from "../../../components/FormContainer";
import swal from "sweetalert";
import "./AdminUpdateQuiz.css";

const AdminUpdateQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();
  const quizId = params.quizId;

  // Sample quiz data to replace backend API calls
  const [oldQuiz, setOldQuiz] = useState({
    quizId: quizId,
    title: "Math Quiz",
    description: "Basic Math Quiz",
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

  const submitHandler = (e) => {
    e.preventDefault();
    if (selectedCategoryId !== null && selectedCategoryId !== "n/a") {
      const updatedQuiz = {
        quizId: quizId,
        title: title,
        description: description,
        isActive: isActive,
        category: categories.find((cat) => cat.catId == selectedCategoryId),
      };
      swal("Quiz Updated!", `${updatedQuiz.title} successfully updated`, "success");
      console.log("Updated Quiz: ", updatedQuiz);
      // Here, you can handle the updated quiz (e.g., save it locally or simulate a backend update)
    } else {
      swal("Error", "Please select a valid category!", "error");
    }
  };

  useEffect(() => {
    // If there's a need to fetch the quiz details or categories (simulated here)
    // Normally, you'd fetch quiz details based on the quizId and categories data
  }, []);

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