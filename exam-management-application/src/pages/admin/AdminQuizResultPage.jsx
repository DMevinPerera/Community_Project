import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../users/UserQuizResultPage.css";
import { Table } from "react-bootstrap";
import Message from "../../components/Message";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase"; 

const AdminQuizResultPage = () => {
  const [quizResults, setQuizResults] = useState([]); // State to store quiz results
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch quiz results from Firestore
  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const usersCollectionRef = collection(db, "users"); // Reference to the "users" collection
        const usersSnapshot = await getDocs(usersCollectionRef);

        const resultsData = [];

        // Loop through each user
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();

          // Fetch marks sub-collection for the user
          const marksCollectionRef = collection(db, `users/${userDoc.id}/marks`);
          const marksSnapshot = await getDocs(marksCollectionRef);

          // Loop through each mark document
          marksSnapshot.forEach((markDoc) => {
            const markData = markDoc.data();
          
            // Convert Firestore timestamp to a readable format
            const formattedTime = markData.timestamp
              ? new Date(markData.timestamp.seconds * 1000).toLocaleString()
              : "N/A";
          
            resultsData.push({
              username: userData.email, // Use email as username
              firstName: userData.firstName,
              lastName: userData.lastName,
              admissionNumber: userData.admissionNumber,
              obtainedMarks: markData.obtainedMarks,
              totalMarks: markData.totalMarks,
              timeSubmitted: formattedTime, // Use formatted timestamp
              quizTitle: markData.quizTitle,
              categoryTitle: markData.categoryTitle,
            });
          });
          
        }

        setQuizResults(resultsData); // Set quiz results in state
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchQuizResults();
  }, []);

  return (
    <div className="userQuizResultPage__container">
      <div className="userQuizResultPage__sidebar">
        <Sidebar />
      </div>

      <div className="userQuizResultPage__content">
        {loading ? (
          <Message>Loading quiz results...</Message>
        ) : quizResults && quizResults.length !== 0 ? (
          <div className="quiz-result-table">
           
            <Table bordered className="userQuizResultPage__content--table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Admission Number</th>
                  <th>Quiz Title</th>
                  <th>Category Title</th>
                  <th>Obtained Marks</th>
                  <th>Total Marks</th>
                  <th>Time Submitted</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.username}</td>
                    <td>{result.firstName}</td>
                    <td>{result.lastName}</td>
                    <td>{result.admissionNumber}</td>
                    <td>{result.quizTitle}</td>
                    <td>{result.categoryTitle}</td>
                    <td>{result.obtainedMarks}</td>
                    <td>{result.totalMarks}</td>
                    <td>{result.timeSubmitted}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Message>No results to display.</Message>
        )}
      </div>
    </div>
  );
};

export default AdminQuizResultPage;