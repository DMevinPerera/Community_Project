import React, { useEffect, useState } from "react";
import "./UserQuestionsPage.css";
import { Button } from "react-bootstrap";
import Question from "../../components/Question";
import Loader from "../../components/Loader";
import swal from "sweetalert";
import { ClipLoader } from "react-spinners";

const UserQuestionsPage = () => {
  Number.prototype.zeroPad = function () {
    return ("0" + this).slice(-2);
  };

  const quizId = "1"; // Example static quizId
  const quizTitle = "Sample Quiz"; // Example static quiz title
  const [quiz, setQuiz] = useState({
    quizId: quizId,
    title: quizTitle,
  });
  const [questions, setQuestions] = useState([
    { questionId: 1, questionText: "What is React?" },
    { questionId: 2, questionText: "What is JSX?" },
    { questionId: 3, questionText: "What is state in React?" },
  ]);
  const [timeRemaining, setTimeRemaining] = useState(questions.length * 2 * 60);

  let answers = {};
  let intervalId = null;

  useEffect(() => {
    intervalId = setInterval(() => {
      if (timeRemaining <= 0) {
        submitQuizHandler(true);
      } else {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      intervalId = null;
    };
  }, [timeRemaining]);

  const submitQuizHandler = (isTimesUp = false) => {
    if (isTimesUp) {
      swal(
        "Quiz Submitted!",
        `You have completed the quiz: ${quizTitle}.`,
        "success"
      );
    } else {
      swal({
        title: "Are you sure?",
        text: "Once submitted, you will not be able to modify your answers!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willSubmit) => {
        if (willSubmit) {
          swal(
            "Quiz Submitted!",
            `You have completed the quiz: ${quizTitle}.`,
            "success"
          );
        }
      });
    }
    clearInterval(intervalId);
    intervalId = null;
  };

  return (
    <div className="userQuestionsPage__container">
      <div className="userQuestionsPage__content">
        <h2>{`Questions : ${quizTitle}`}</h2>
        <div className="userQuestionsPage__content--options">
          <Button
            className="userQuestionsPage__content--button"
            onClick={() => submitQuizHandler()}
          >
            Submit Quiz
          </Button>
          <div className="userQuestionsPage__content--spinner">
            <ClipLoader color="#007bff" size={50} loading={timeRemaining > 0} />
            <h4 style={{ marginTop: "18px" }}>{`${parseInt(
              timeRemaining / 60
            ).zeroPad()} : ${(timeRemaining % 60).zeroPad()}`}</h4>
            Timer
          </div>
        </div>
        {questions.length > 0 ? (
          questions.map((q, index) => {
            return <Question key={index} number={index + 1} question={q} />;
          })
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default UserQuestionsPage;
