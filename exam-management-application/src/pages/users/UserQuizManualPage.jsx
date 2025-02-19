import React, { useEffect, useState } from "react";
import "./UserQuizManualPage.css";
import SidebarUser from "../../components/SidebarUser";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Loader from "../../components/Loader";

const UserQuizManualPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([
    {
      quizId: "1",
      title: "Sample Quiz",
      description: "This is a sample quiz for practice.",
      numOfQuestions: 5,
    },
    {
      quizId: "2",
      title: "Another Sample Quiz",
      description: "This is another sample quiz for practice.",
      numOfQuestions: 10,
    },
  ]);
  const quizId = new URLSearchParams(window.location.search).get("quizId");
  const quiz = quizzes.find((q) => q.quizId === quizId);

  const startQuizHandler = (quizTitle, quizId) => {
    navigate(`/questions/?quizId=${quizId}&quizTitle=${quizTitle}`);
  };

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  return (
    <div className="quizManualPage__container">
      <div className="quizManualPage__sidebar">
        <SidebarUser />
      </div>
      {quiz ? (
        <div className="quizManualPage__content">
          <div className="quizManualPage__content--section">
            <h5>Read the instruction of this page carefully</h5>
            <p style={{ color: "grey" }}>One more step to go</p>
          </div>

          <div className="quizManualPage__content--section">
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
          </div>

          <hr />

          <div>
            <h3>Important Instructions</h3>
            <ul>
              <li>This quiz is only for practice purpose.</li>
              <li>
                You have to submit quiz within <strong>{quiz.numOfQuestions * 2}</strong> minutes.
              </li>
              <li>You can attempt the quiz any number of times.</li>
              <li>
                There are <strong>{quiz.numOfQuestions} questions</strong> in this quiz.
              </li>
              <li>This quiz is only for practice purpose.</li>
              <li>
                Total Marks for this quiz is <strong>{quiz.numOfQuestions * 5}.</strong>
              </li>
              <li>All questions are of MCQ type.</li>
            </ul>
          </div>

          <hr />

          <div>
            <h3>Attempting Quiz</h3>
            <ul>
              <li>
                Click <strong>Start Quiz</strong> button to start the quiz.
              </li>
              <li>
                The timer will start the moment you click on the Start Quiz button.
              </li>
              <li>
                You cannot resume this quiz if interrupted due to any reason.
              </li>
              <li>
                Click on <strong>Submit Quiz</strong> button upon completion.
              </li>
              <li>
                The result of the test is generated automatically in PDF format.
              </li>
            </ul>
          </div>

          <Button
            className="quizManualPage__content--button"
            onClick={() => startQuizHandler(quiz.title, quiz.quizId)}
            style={{
              border: "1px solid grey",
              margin: "2px 8px",
            }}
            variant="primary"
          >
            Start Quiz
          </Button>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default UserQuizManualPage;