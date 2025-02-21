import React, { useEffect, useState } from "react";
import "./UserQuestionsPage.css";
import { Button } from "react-bootstrap";
import Question from "../../components/Question";
import { ClipLoader } from "react-spinners";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

const UserQuestionsPage = () => {
  const navigate = useNavigate();
  const quizId = new URLSearchParams(window.location.search).get("quizId");
  const catId = new URLSearchParams(window.location.search).get("catId");
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null); // Timer in seconds
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        if (!quizId || !catId) {
          console.error("Quiz ID or Category ID is missing!");
          return;
        }

        // Fetch quiz details
        const quizDocRef = doc(db, `categories/${catId}/quizzes`, quizId);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuiz({ id: quizDocSnap.id, ...quizDocSnap.data() });

          // Fetch questions
          const questionsCollectionRef = collection(db, `categories/${catId}/quizzes/${quizId}/questions`);
          const questionsSnapshot = await getDocs(questionsCollectionRef);
          const questionsData = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(questionsData);

          // Set timer (90 seconds per question)
          const totalSeconds = questionsData.length * 90;
          setTimeRemaining(totalSeconds);
        } else {
          console.error("Quiz not found!");
        }
      } catch (error) {
        console.error("Error fetching quiz and questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndQuestions();
  }, [quizId, catId]);

  // Timer logic
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          submitQuizHandler(true); // Submit quiz when time runs out
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Handle user answers
  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedAnswer,
    }));
  };

  // Submit quiz handler
  const submitQuizHandler = async (isTimesUp = false) => {
    if (isSubmitted) return; // Prevent multiple submissions

    try {
      let obtainedMarks = 0;

      // Calculate marks (2 marks per correct answer)
      questions.forEach((question) => {
        if (answers[question.id] === question.correctAnswer) {
          obtainedMarks += 2;
        }
      });

      const userId = auth.currentUser.uid;
      const totalMarks = questions.length * 2;

      // Fetch category name
      const categoryDocRef = doc(db, `categories`, catId);
      const categoryDocSnap = await getDoc(categoryDocRef);
      const categoryName = categoryDocSnap.exists() ? categoryDocSnap.data().title : "No Category";

      // Store quiz attempt in Firestore
      const quizAttempt = {
        userId,
        quizId,
        categoryId: catId,
        quizTitle: quiz.title,
        categoryTitle: categoryName, // Store category name
        obtainedMarks: isTimesUp ? 0 : obtainedMarks, // If time is up, marks are 0
        totalMarks,
        answers,
        timestamp: new Date(),
      };

      const attemptRef = doc(collection(db, `users/${userId}/marks`));
      await setDoc(attemptRef, quizAttempt);

      // Navigate to the result page
      if (!isTimesUp) {
        navigate(`/quizResults`);
      }
      setIsSubmitted(true); // Mark quiz as submitted
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz. Please try again.");
    }
  };

  return (
    <div className="userQuestionsPage__container">
      <div className="userQuestionsPage__content">
        <h2>{`Questions: ${quiz?.title || "Loading..."}`}</h2>
        <div className="userQuestionsPage__content--options">
          <Button
            className="userQuestionsPage__content--button"
            onClick={() => submitQuizHandler()}
            disabled={timeRemaining <= 0 || isSubmitted} // Disable button when time is up or quiz is submitted
          >
            Submit Quiz
          </Button>
          <div className="userQuestionsPage__content--spinner">
            <ClipLoader color="#007bff" size={50} loading={timeRemaining > 0} />
            <h4 style={{ marginTop: "18px" }}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </h4>
            Timer
          </div>
        </div>
        {loading ? (
          <p>Loading questions...</p>
        ) : questions.length > 0 ? (
          questions.map((q, index) => (
            <Question
              key={index}
              number={index + 1}
              question={q}
              selectedAnswer={answers[q.id]}
              onAnswerChange={(selectedAnswer) => handleAnswerChange(q.id, selectedAnswer)}
              disabled={timeRemaining <= 0 || isSubmitted} // Disable questions when time is up or quiz is submitted
            />
          ))
        ) : (
          <p>No questions found for this quiz.</p>
        )}
      </div>
    </div>
  );
};

export default UserQuestionsPage;