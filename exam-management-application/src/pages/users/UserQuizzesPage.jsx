import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import "./UserQuizzesPage.css";
import { Card, Col, Row } from "react-bootstrap";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";

const UserQuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Fetch all categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch quizzes from all categories
        const allQuizzes = [];
        for (const category of categoriesData) {
          const quizzesCollectionRef = collection(db, `categories/${category.id}/quizzes`);
          const quizzesQuery = query(quizzesCollectionRef, where("isActive", "==", true));
          const quizzesSnapshot = await getDocs(quizzesQuery);

          // Fetch questions for each quiz and calculate numOfQuestions
          for (const quizDoc of quizzesSnapshot.docs) {
            const quizData = quizDoc.data();
            const questionsCollectionRef = collection(db, `categories/${category.id}/quizzes/${quizDoc.id}/questions`);
            const questionsSnapshot = await getDocs(questionsCollectionRef);
            const numOfQuestions = questionsSnapshot.size; // Number of questions in the sub-collection

            allQuizzes.push({
              id: quizDoc.id,
              categoryId: category.id,
              categoryTitle: category.title,
              title: quizData.title || "No Title",
              description: quizData.description || "No Description",
              numOfQuestions: numOfQuestions, // Dynamically calculated
              ...quizData,
            });
          }
        }

        setQuizzes(allQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="userQuizzesPage__container">
      <div className="userQuizzesPage__sidebar">
        <SidebarUser />
      </div>

      <div className="userQuizzesPage__content">
        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <Row>
            {quizzes.map((q, index) => (
              <Col key={index} xl={3} lg={4} md={6} sm={6} xs={12}>
                <Card
                  bg="light"
                  text="dark"
                  style={{
                    width: "100%",
                    height: "95%",
                    padding: "5px",
                    margin: "auto",
                    marginTop: "5px",
                    minWidth: "0px",
                    wordWrap: "break-word",
                  }}
                  className="mb-2"
                >
                  <Card.Body>
                    <Card.Title>{q.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {q.categoryTitle || "No Category"}
                    </Card.Subtitle>
                    <Card.Text>{q.description}</Card.Text>
                    <div className="userQuizzesPage__content--ButtonsList">
                      <div
                        className="userQuizzesPage__content--Button"
                        onClick={() =>
                          navigate(`/quizManual?quizId=${q.id}&catId=${q.categoryId}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {`Start`}
                      </div>

                      {/* Display total marks, number of questions, and time allocated */}
                      <div
                        className="userQuizzesPage__content--Button"
                        style={{ color: "black", backgroundColor: "white" }}
                      >{`Total Marks: ${q.numOfQuestions * 2}`}</div>

                      <div
                        className="userQuizzesPage__content--Button"
                        style={{ color: "black", backgroundColor: "white" }}
                      >{`Questions: ${q.numOfQuestions}`}</div>

                      <div
                        className="userQuizzesPage__content--Button"
                        style={{ color: "black", backgroundColor: "white" }}
                      >{`Time: ${q.numOfQuestions * 1.5} Minutes`}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No Quizzes Available</p>
        )}
      </div>
    </div>
  );
};

export default UserQuizzesPage;