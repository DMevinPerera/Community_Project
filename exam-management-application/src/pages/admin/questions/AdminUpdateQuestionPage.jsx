import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import swal from "sweetalert";
import FormContainer from "../../../components/FormContainer";
import Sidebar from "../../../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminUpdateQuestionPage.css";

const AdminUpdateQuestionPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  
  const quesId = params.quesId;
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quizId");

  // Simulate fetching the question based on quesId
  const mockQuestions = [
    { quesId: "1", content: "What is React?", option1: "Library", option2: "Framework", option3: "Language", option4: "Database", answer: "option1" },
    { quesId: "2", content: "What is useState?", option1: "A hook", option2: "A component", option3: "A function", option4: "An event", answer: "option1" },
  ];

  const [oldQuestion, setOldQuestion] = useState(() =>
    mockQuestions.find((question) => question.quesId === quesId)
  );

  const [content, setContent] = useState(oldQuestion ? oldQuestion.content : "");
  const [image, setImage] = useState(oldQuestion ? oldQuestion.image : "");
  const [option1, setOption1] = useState(oldQuestion ? oldQuestion.option1 : "");
  const [option2, setOption2] = useState(oldQuestion ? oldQuestion.option2 : "");
  const [option3, setOption3] = useState(oldQuestion ? oldQuestion.option3 : "");
  const [option4, setOption4] = useState(oldQuestion ? oldQuestion.option4 : "");
  const [answer, setAnswer] = useState(oldQuestion ? oldQuestion.answer : null);

  const onSelectAnswerHandler = (e) => {
    setAnswer(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (answer !== null && answer !== "n/a") {
      // Simulating the update of the question
      const updatedQuestion = {
        quesId: quesId,
        content: content,
        image: image,
        option1: option1,
        option2: option2,
        option3: option3,
        option4: option4,
        answer: answer,
        quiz: {
          quizId: quizId,
        },
      };

      // Simulate success message after update
      swal("Question Updated!", `${content} successfully updated`, "success");
      console.log("Updated Question:", updatedQuestion);
    } else {
      swal("Invalid Selection!", "Please select a valid answer option", "error");
    }
  };

  return (
    <div className="adminUpdateQuestionPage__container">
      <div className="adminUpdateQuestionPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminUpdateQuestionPage__content">
        <FormContainer>
          <h2>Update Question</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="content">
              <Form.Label>Question</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="3"
                type="text"
                placeholder="Enter Question Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option1">
              <Form.Label>Option 1</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="2"
                type="text"
                placeholder="Enter Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option2">
              <Form.Label>Option 2</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="2"
                type="text"
                placeholder="Enter Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option3">
              <Form.Label>Option 3</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="2"
                type="text"
                placeholder="Enter Option 3"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option4">
              <Form.Label>Option 4</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="2"
                type="text"
                placeholder="Enter Option 4"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </Form.Group>

            <div className="my-3">
              <label htmlFor="answer-select">Choose Correct Option:</label>
              <Form.Select
                aria-label="Choose Correct Option"
                id="answer-select"
                onChange={onSelectAnswerHandler}
              >
                <option value="n/a">Choose Option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </Form.Select>
            </div>

            <Button
              className="my-5 adminUpdateQuestionPage__content--button"
              type="submit"
              variant="primary"
            >
              Update
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminUpdateQuestionPage;