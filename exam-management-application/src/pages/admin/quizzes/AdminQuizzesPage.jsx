import React, { useState, useEffect } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase"; // Assuming Firebase setup in firebase.js
import "./AdminQuizzesPage.css";
import Sidebar from "../../../components/Sidebar";
import Message from "../../../components/Message";

const AdminQuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quizzes from Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const fetchedQuizzes = await Promise.all(
          querySnapshot.docs.map(async (quizDoc) => { // Renamed `doc` to `quizDoc`
            const quizData = { quizId: quizDoc.id, ...quizDoc.data() };
  
            // Fetch category details using categoryId
            if (quizData.categoryId) {
              const categoryRef = doc(db, "categories", quizData.categoryId);
              const categorySnap = await getDoc(categoryRef);
              quizData.category = categorySnap.exists() ? categorySnap.data() : null;
            }
  
            return quizData;
          })
        );
  
        // console.log("Fetched Quizzes:", fetchedQuizzes); // Debugging log
        setQuizzes(fetchedQuizzes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
        setLoading(false);
      }
    };
  
    fetchQuizzes();
  }, []);
  

  const addNewQuizHandler = () => {
    navigate("/adminAddQuiz");
  };

  const deleteQuizHandler = async (quiz) => {
    try {
      const quizRef = doc(db, "quizzes", quiz.quizId); // Reference the document
      await deleteDoc(quizRef); // Delete the document
      alert(`${quiz.title} successfully deleted`);
  
      // Update the state to remove the deleted quiz
      setQuizzes((prevQuizzes) => prevQuizzes.filter(q => q.quizId !== quiz.quizId));
    } catch (e) {
      console.error("Error deleting quiz: ", e);
      alert("Error deleting quiz!");
    }
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
        {loading ? (
          <div>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <Message>No quizzes are present. Try adding some quizzes.</Message>
        ) : (
          quizzes.map((quiz, index) => {
            // Log the quiz object to check its structure
            console.log(quiz);

            // Check if quiz data is valid before accessing properties
            if (!quiz || !quiz.title || !quiz.category || !quiz.category.title) {
              return null; // Skip rendering this quiz if it's malformed
            }
            return (
              <ListGroup
                className="adminQuizzesPage__content--quizzesList"
                key={index}
              >
                <ListGroup.Item className="align-items-start" action>
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{quiz.title}</div>
                    <p style={{ color: "grey" }}>
                      {quiz.category ? quiz.category.title : "Unknown Category"}
                    </p>
                    <p className="my-3">{quiz.description}</p>
                    <div className="adminQuizzesPage__content--ButtonsList">
                      <div
                        onClick={() => questionsHandler(quiz.quizId, quiz.title)}
                        style={buttonStyle("rgb(68 177 49)", "Questions")}
                      >
                        Questions
                      </div>
                      <div style={buttonStyle()}>
                        {`Marks : ${quiz.numOfQuestions * 5}`}
                      </div>
                      <div style={buttonStyle()}>
                        {`${quiz.numOfQuestions} Questions`}
                      </div>
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
            );
          })
        )}
        <Button
          variant=""
          className="adminQuizzesPage__content--button"
          onClick={addNewQuizHandler}
        >
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
