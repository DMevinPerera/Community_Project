import React, { useState, useEffect } from "react";
import { Button, ListGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./AdminQuizzesPage.css";
import Sidebar from "../../../components/Sidebar";
import Message from "../../../components/Message";

const AdminQuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = [];
        let fetchedQuizzes = [];

        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryId = categoryDoc.id;
          const categoryData = categoryDoc.data();
          fetchedCategories.push({ catId: categoryId, title: categoryData.title });

          const quizzesSnapshot = await getDocs(collection(db, "categories", categoryId, "quizzes"));
          quizzesSnapshot.forEach((quizDoc) => {
            fetchedQuizzes.push({
              quizId: quizDoc.id,
              categoryId,
              category: categoryData,
              ...quizDoc.data(),
            });
          });
        }

        setCategories(fetchedCategories);
        setQuizzes(fetchedQuizzes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteQuizHandler = async (quiz) => {
    try {
      const quizRef = doc(db, "categories", quiz.categoryId, "quizzes", quiz.quizId);
      await deleteDoc(quizRef);
      alert(`${quiz.title} successfully deleted`);

      
      setQuizzes((prevQuizzes) => prevQuizzes.filter(q => q.quizId !== quiz.quizId));
    } catch (e) {
      console.error("Error deleting quiz: ", e);
      alert("Error deleting quiz!");
    }
  };

  const filteredQuizzes = selectedCategory
    ? quizzes.filter((quiz) => quiz.categoryId === selectedCategory)
    : quizzes;

  return (
    <div className="adminQuizzesPage__container">
      <div className="adminQuizzesPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuizzesPage__content">
        <h2>Quizzes</h2>

      
        <Form.Select
          className="my-3"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.catId} value={cat.catId}>
              {cat.title}
            </option>
          ))}
        </Form.Select>

        {loading ? (
          <div>Loading quizzes...</div>
        ) : filteredQuizzes.length === 0 ? (
          <Message>No quizzes found for this category.</Message>
        ) : (
          filteredQuizzes.map((quiz) => (
            <ListGroup key={quiz.quizId} className="adminQuizzesPage__content--quizzesList">
              <ListGroup.Item className="align-items-start" action>
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{quiz.title}</div>
                  <p style={{ color: "grey" }}>{quiz.category.title}</p>
                  <p className="my-3">{quiz.description}</p>
                  <div className="adminQuizzesPage__content--ButtonsList">
                  <div
  onClick={() => navigate(`/adminQuestions/?quizId=${quiz.quizId}&categoryId=${quiz.categoryId}&quizTitle=${quiz.title}`)}
  style={buttonStyle("rgb(68 177 49)")}
>
  Questions
</div>
                    <div style={buttonStyle()}>{`Marks : ${quiz.numOfQuestions * 5}`}</div>
                    <div style={buttonStyle()}>{`${quiz.numOfQuestions} Questions`}</div>
                    <div onClick={() => navigate(`/adminUpdateQuiz/${quiz.quizId}`)} style={buttonStyle("rgb(68 177 49)")}>
                      Update
                    </div>
                    <div onClick={() => deleteQuizHandler(quiz)} style={buttonStyle("#ff0b0bdb")}>
                      Delete
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          ))
        )}
        <Button variant="" className="adminQuizzesPage__content--button" onClick={() => navigate("/adminAddQuiz")}>
          Add Quiz
        </Button>
      </div>
    </div>
  );
};

const buttonStyle = (bgColor = "grey") => ({
  border: "1px solid grey",
  width: "100px",
  height: "35px",
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
