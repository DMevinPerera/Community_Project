import React, { useState } from "react";
import "./AdminQuestionsPage.css";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import Question from "../../../components/Question";
import Loader from "../../../components/Loader";

const AdminQuestionsPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]); // Local state to store questions
  const [loading, setLoading] = useState(false); // Loading state for simulating data fetch
  const quizId = new URLSearchParams(window.location.search).get("quizId");
  const quizTitle = new URLSearchParams(window.location.search).get("quizTitle");

  // Simulate adding a new question
  const addNewQuestionHandler = () => {
    navigate(`/adminAddQuestion/?quizId=${quizId}`);
  };

  // Simulate fetching questions when the component mounts
  React.useEffect(() => {
    setLoading(true);
    // Simulate fetching questions
    setTimeout(() => {
      const mockQuestions = [
        { content: "What is React?", option1: "Library", option2: "Framework", option3: "Language", option4: "Database", answer: "option1" },
        { content: "What is useState?", option1: "A hook", option2: "A component", option3: "A function", option4: "An event", answer: "option1" },
      ];
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000); // Simulate loading time
  }, []);

  return (
    <div className="adminQuestionsPage__container">
      <div className="adminQuestionsPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuestionsPage__content">
        <h2>{`Questions: ${quizTitle}`}</h2>
        <Button
          className="adminQuestionsPage__content--button"
          onClick={addNewQuestionHandler}
        >
          Add Question
        </Button>
        {loading ? (
          <Loader />
        ) : (
          questions.map((q, index) => (
            <Question key={index} number={index + 1} question={q} isAdmin={true} />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuestionsPage;