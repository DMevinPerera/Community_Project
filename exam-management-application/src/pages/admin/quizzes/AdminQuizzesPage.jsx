import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./AdminQuizzesPage.css";
import Sidebar from "../../../components/Sidebar";
import Message from "../../../components/Message";

const AdminQuizzesPage = () => {
  const navigate = useNavigate();

  // Sample quiz data to replace backend API calls
  const [quizzes, setQuizzes] = useState([
    { quizId: 1, title: "Grade 9", description: "Basic Lesson 1 quiz", numOfQuestions: 5, category: { title: "Math", catId: 1 } },
    { quizId: 2, title: "Grade 10", description: "Basic Lesson 2 quiz", numOfQuestions: 5, category: { title: "Science", catId: 2 } },
    // Add more quizzes here for testing
  ]);

  const addNewQuizHandler = () => {
    navigate("/adminAddQuiz");
  };

  const deleteQuizHandler = (quiz) => {
    const updatedQuizzes = quizzes.filter(q => q.quizId !== quiz.quizId);
    setQuizzes(updatedQuizzes);
    alert(`${quiz.title} successfully deleted`);
  };

  const updateQuizHandler = (quizId) => {
    navigate(`/adminUpdateQuiz/${quizId}`);
  };

  const questionsHandler = (quizId, quizTitle) => {
    navigate(`/adminQuestions/?quizId=${quizId}&quizTitle=${quizTitle}`);
  };

  return (
    <div className="adminQuizzesPage__container">
      <div className="adminQuizzesPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuizzesPage__content">
        <h2>Quizzes</h2>
        {quizzes.length === 0 ? (
          <Message>No quizzes are present. Try adding some quizzes.</Message>
        ) : (
          quizzes.map((quiz, index) => (
            <ListGroup className="adminQuizzesPage__content--quizzesList" key={index}>
              <ListGroup.Item className="align-items-start" action>
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{quiz.title}</div>
                  <p style={{ color: "grey" }}>{quiz.category.title}</p>
                  <p className="my-3">{quiz.description}</p>
                  <div className="adminQuizzesPage__content--ButtonsList">
                    <div
                      onClick={() => questionsHandler(quiz.quizId, quiz.title)}
                      style={buttonStyle("rgb(68 177 49)", "Questions")}
                    >
                      Questions
                    </div>
                    <div style={buttonStyle()}>{`Marks : ${quiz.numOfQuestions * 5}`}</div>
                    <div style={buttonStyle()}>{`${quiz.numOfQuestions} Questions`}</div>
                    <div
                      onClick={() => updateQuizHandler(quiz.quizId)}
                      style={buttonStyle("rgb(68 177 49)", "Update")}
                    >
                      Update
                    </div>
                    <div
                      onClick={() => deleteQuizHandler(quiz)}
                      style={buttonStyle("#ff0b0bdb", "Delete")}
                    >
                      Delete
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          ))
        )}
        <Button variant="" className="adminQuizzesPage__content--button" onClick={addNewQuizHandler}>
          Add Quiz
        </Button>
      </div>
    </div>
  );
};

const buttonStyle = (bgColor = "grey", text = "") => ({
  border: "1px solid grey",
  width: "100px",
  height: "35px",
  padding: "1px",
  textAlign: "center",
  borderRadius: "5px",
  color: "white",
  backgroundColor: bgColor,
  margin: "0px 4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

export default AdminQuizzesPage;