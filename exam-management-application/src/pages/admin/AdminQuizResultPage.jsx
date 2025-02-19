import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../users/UserQuizResultPage.css";
import { Table } from "react-bootstrap";
import Message from "../../components/Message";

const AdminQuizResultPage = () => {
  // Static data for quizzes and quiz results
  const [quizResults] = useState([
    {
      quiz: {
        quizId: 1,
        title: "Grade 9",
        category: {
          title: "Lesson 1",
        },
        numOfQuestions: 10,
      },
      results: [
        {
          username: "john_doe",
          firstName: "John",
          lastName: "Doe",
          admissionNumber: "12345",
          obtainedMarks: 45,
          totalMarks: 50,
          timeSubmitted: "2024-12-01 10:30:00",
        },
        {
          username: "jane_doe",
          firstName: "Jane",
          lastName: "Doe",
          admissionNumber: "12346",
          obtainedMarks: 40,
          totalMarks: 50,
          timeSubmitted: "2024-12-01 11:00:00",
        },
      ],
    },
    {
      quiz: {
        quizId: 2,
        title: "Grade 10",
        category: {
          title: "Lesson 2",
        },
        numOfQuestions: 8,
      },
      results: [
        {
          username: "susan_lee",
          firstName: "Susan",
          lastName: "Lee",
          admissionNumber: "12347",
          obtainedMarks: 35,
          totalMarks: 40,
          timeSubmitted: "2024-12-02 14:00:00",
        },
      ],
    },
  ]);

  return (
    <div className="userQuizResultPage__container">
      <div className="userQuizResultPage__sidebar">
        <Sidebar />
      </div>

      <div className="userQuizResultPage__content">
        {quizResults && quizResults.length !== 0 ? (
          quizResults.map((quizResult, index) => (
            <div key={index} className="quiz-result-table">
              {/* Quiz heading */}
              <h3>
                Quiz ID: {quizResult.quiz.quizId} | {quizResult.quiz.title} (
                {quizResult.quiz.category.title})
              </h3>

              {/* Student results table */}
              <Table bordered className="userQuizResultPage__content--table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Admission Number</th>
                    <th>Obtained Marks</th>
                    <th>Total Marks</th>
                    <th>Time Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {quizResult.results.map((student, idx) => (
                    <tr key={idx}>
                      <td>{student.username}</td>
                      <td>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>{student.admissionNumber}</td>
                      <td>{student.obtainedMarks}</td>
                      <td>{student.totalMarks}</td>
                      <td>{student.timeSubmitted}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        ) : (
          <Message>No results to display.</Message>
        )}
      </div>
    </div>
  );
};

export default AdminQuizResultPage;
