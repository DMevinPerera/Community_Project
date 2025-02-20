import React, { useState, useEffect } from "react";
import "./AdminQuestionsPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import Question from "../../../components/Question";
import Loader from "../../../components/Loader";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";

const AdminQuestionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const quizId = params.get("quizId");
  const categoryId = params.get("categoryId");
  const quizTitle = params.get("quizTitle");

  if (!quizId) {
    return <div>Error: Missing quizId in URL!</div>;
  }

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = categoryId
          ? collection(db, "categories", categoryId, "quizzes", quizId, "questions")
          : collection(db, "quizzes", quizId, "questions");

        const questionsSnapshot = await getDocs(questionsRef);
        if (!questionsSnapshot.empty) {
          const fetchedQuestions = questionsSnapshot.docs.map((doc) => ({
            quesId: doc.id,
            ...doc.data(),
          }));
          setQuestions(fetchedQuestions);
        } else {
          setQuestions([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to fetch questions.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, categoryId]);

  const addNewQuestionHandler = () => {
    navigate(
      categoryId
        ? `/adminAddQuestion/?quizId=${quizId}&categoryId=${categoryId}`
        : `/adminAddQuestion/?quizId=${quizId}`
    );
  };

  // Handle deletion of question
  const handleDeleteQuestion = (quesId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((q) => q.quesId !== quesId)
    );
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="adminQuestionsPage__container">
      <div className="adminQuestionsPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuestionsPage__content">
        <h2>{quizTitle ? `Questions: ${quizTitle}` : "Questions"}</h2>
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
            <Question
              key={q.quesId}
              number={index + 1}
              question={q}
              quizId={quizId}
              categoryId={categoryId}
              isAdmin={true}
              onDelete={handleDeleteQuestion} // Pass the delete handler
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
