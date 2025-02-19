import React, { useEffect, useState } from "react";
import SidebarUser from "../../components/SidebarUser";
import "./UserQuizResultPage.css";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import Message from "../../components/Message";
import { Link } from "react-router-dom";

const UserQuizResultPage = () => {
  const navigate = useNavigate();

  // Static quiz result data
  const [quizResults, setQuizResults] = useState([
    {
      quiz: {
        quizId: "1",
        title: "Sample Quiz",
        category: { title: "General Knowledge" },
        maxMarks: 25,
      },
      totalObtainedMarks: 20,
      attemptDatetime: "2024-12-05 10:30 AM",
    },
    {
      quiz: {
        quizId: "2",
        title: "Math Quiz",
        category: { title: "Mathematics" },
        maxMarks: 30,
      },
      totalObtainedMarks: 25,
      attemptDatetime: "2024-12-04 02:15 PM",
    },
  ]);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  return (
    <div className="userQuizResultPage__container">
      <div className="userQuizResultPage__sidebar">
        <SidebarUser />
      </div>

      <div className="userQuizResultPage__content">
        {quizResults && quizResults.length !== 0 ? (
          <Table bordered className="userQuizResultPage__content--table">
            <thead>
              <tr>
                <th>Quiz Id</th>
                <th>Quiz Name</th>
                <th>Category Name</th>
                <th>Obtained Marks</th>
                <th>Total Marks</th>
                <th>Date</th>
              </tr>
            </thead>
            {quizResults.map((r, index) => {
              return (
                <tbody key={index}>
                  <tr>
                    <td>{r.quiz.quizId}</td>
                    <td>{r.quiz.title}</td>
                    <td>{r.quiz.category.title}</td>
                    <td>{r.totalObtainedMarks}</td>
                    <td>{r.quiz.maxMarks}</td>
                    <td>{r.attemptDatetime}</td>
                  </tr>
                </tbody>
              );
            })}
          </Table>
        ) : (
          <Message>
            No results to display. Attempt any <Link to="/quizzes">Quiz.</Link>
          </Message>
        )}
      </div>
    </div>
  );
};

export default UserQuizResultPage;