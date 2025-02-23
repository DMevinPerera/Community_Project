import React, { useEffect, useState } from "react";
import SidebarUser from "../../components/SidebarUser";
import "./UserQuizResultPage.css";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../config/firebase";

const UserQuizResultPage = () => {
  const navigate = useNavigate();
  const [quizResults, setQuizResults] = useState([]);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const userMarksRef = collection(db, `users/${auth.currentUser.uid}/marks`);
        const quizResultsSnapshot = await getDocs(userMarksRef);
        const quizResultsData = quizResultsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        
        quizResultsData.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        
        const resultsWithSerial = quizResultsData.map((result, index) => ({
          ...result,
          serialNumber: index + 1,
        }));

        setQuizResults(resultsWithSerial);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      }
    };

    fetchQuizResults();
  }, []);

  return (
    <div className="userQuizResultPage__container">
      <div className="userQuizResultPage__sidebar">
        <SidebarUser />
      </div>

      <div className="userQuizResultPage__content">
        {quizResults.length > 0 ? (
          <Table bordered className="userQuizResultPage__content--table">
            <thead>
              <tr>
                <th>#</th>
                <th>Quiz Name</th>
                <th>Category Name</th>
                <th>Obtained Marks</th>
                <th>Total Marks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {quizResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.serialNumber}</td>
                  <td>{result.quizTitle}</td>
                  <td>{result.categoryTitle}</td>
                  <td>{result.obtainedMarks}</td>
                  <td>{result.totalMarks}</td>
                  <td>{result.timestamp?.toDate().toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No results to display. Attempt any quiz.</p>
        )}
      </div>
    </div>
  );
};

export default UserQuizResultPage;