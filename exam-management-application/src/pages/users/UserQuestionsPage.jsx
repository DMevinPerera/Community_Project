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
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        if (!quizId || !catId) {
          console.error("Quiz ID or Category ID is missing!");
          return;
        }

        
        const quizDocRef = doc(db, `categories/${catId}/quizzes`, quizId);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuiz({ id: quizDocSnap.id, ...quizDocSnap.data() });

          
          const questionsCollectionRef = collection(db, `categories/${catId}/quizzes/${quizId}/questions`);
          const questionsSnapshot = await getDocs(questionsCollectionRef);
          const questionsData = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(questionsData);

          
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

 
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          submitQuizHandler(true); 
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

 
  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedAnswer,
    }));
  };

  
  const submitQuizHandler = async (isTimesUp = false) => {
    if (isSubmitted) return; 

    try {
      let obtainedMarks = 0;

      
      questions.forEach((question) => {
        if (answers[question.id] === question.correctAnswer) {
          obtainedMarks += 2;
        }
      });

      const userId = auth.currentUser.uid;
      const totalMarks = questions.length * 2;

      
      const categoryDocRef = doc(db, `categories`, catId);
      const categoryDocSnap = await getDoc(categoryDocRef);
      const categoryName = categoryDocSnap.exists() ? categoryDocSnap.data().title : "No Category";

      
      const quizAttempt = {
        userId,
        quizId,
        categoryId: catId,
        quizTitle: quiz.title,
        categoryTitle: categoryName, 
        obtainedMarks: isTimesUp ? 0 : obtainedMarks, 
        totalMarks,
        answers,
        timestamp: new Date(),
      };

      const attemptRef = doc(collection(db, `users/${userId}/marks`));
      await setDoc(attemptRef, quizAttempt);

      
      if (!isTimesUp) {
        navigate(`/quizResults`);
      }
      setIsSubmitted(true); 
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
            disabled={timeRemaining <= 0 || isSubmitted} 
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
              disabled={timeRemaining <= 0 || isSubmitted} 
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