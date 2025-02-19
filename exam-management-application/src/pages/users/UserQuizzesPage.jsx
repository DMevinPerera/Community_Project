import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarUser from "../../components/SidebarUser";
import "./UserQuizzesPage.css";
import { Card, Col, Row } from "react-bootstrap";

const UserQuizzesPage = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get("catId");

  // Static quizzes data
  const [quizzes, setQuizzes] = useState([
    {
      quizId: "1",
      title: "Sample Quiz 1",
      description: "A general knowledge quiz.",
      category: { catId: "101", title: "General Knowledge" },
      numOfQuestions: 10,
    },
    {
      quizId: "2",
      title: "Grade 9",
      description: "Lesson 1 Quiz Work",
      category: { catId: "102", title: "Mathematics" },
      numOfQuestions: 15,
    },
    {
      quizId: "3",
      title: "Grade 10",
      description: "Lesson 2 Quiz Work",
      category: { catId: "103", title: "Science" },
      numOfQuestions: 12,
    },
  ]);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  return (
    <div className="userQuizzesPage__container">
      <div className="userQuizzesPage__sidebar">
        <SidebarUser />
      </div>

      <div className="userQuizzesPage__content">
        {quizzes ? (
          <Row>
            {quizzes.map((q, index) => {
              if ((catId && catId === q.category.catId) || catId === null) {
                return (
                  <Col
                    key={index}
                    xl={3}
                    lg={4}
                    md={6}
                    sm={6}
                    xs={12}
                  >
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
                          {q.category.title}
                        </Card.Subtitle>
                        <Card.Text>{q.description}</Card.Text>
                        <div className="userQuizzesPage__content--ButtonsList">
                          <div
                            className="userQuizzesPage__content--Button"
                            onClick={() =>
                              navigate(`/quizManual?quizId=${q.quizId}`)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {`Start`}
                          </div>

                          <div
                            className="userQuizzesPage__content--Button"
                            style={{ color: "black", backgroundColor: "white" }}
                          >{`${q.numOfQuestions * 2} Minutes`}</div>

                          <div
                            className="userQuizzesPage__content--Button"
                            style={{ color: "black", backgroundColor: "white" }}
                          >{`${q.numOfQuestions} Questions`}</div>

                          <div
                            className="userQuizzesPage__content--Button"
                            style={{ color: "black", backgroundColor: "white" }}
                          >{`Marks : ${q.numOfQuestions * 5}`}</div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              }
            })}
          </Row>
        ) : (
          <p>No Quizzes Available</p>
        )}
      </div>
    </div>
  );
};

export default UserQuizzesPage;
