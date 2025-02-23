import React, { useState, useEffect } from "react";
import { Form, Button, Table, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "./AdminAttendenceMarking.css";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../config/firebase"; 
import emailjs from "emailjs-com"; 

const AdminAttendanceMarking = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    checkIfToday();
  }, [selectedDate]);

  const checkIfToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setIsToday(selectedDate === today);
    setSelectedGrade("");
    setStudents([]);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleGradeChange = (e) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    fetchStudentsForGrade(grade);
  };

  const fetchStudentsForGrade = async (grade) => {
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("grade", "==", grade));
      const querySnapshot = await getDocs(q);

      const studentsData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        studentsData.push({
          id: doc.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
        });
      });

      const initialAttendance = {};
      studentsData.forEach((student) => {
        initialAttendance[student.id] = "Absent";
      });

      setStudents(studentsData);
      setAttendanceRecords(initialAttendance);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const sendEmail = async (email, name, date, status) => {
    try {
      
      const serviceID = "service_p9biarf"; 
      const templateID = "template_g5tyvc7"; 
      const userID = "oM80BG7ndTZKausBX";

      
      await emailjs.send(
        serviceID,
        templateID,
        {
          to_email: email,
          name: name,
          date: date,
          status: status,
        },
        userID
      );

      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleSubmitAttendance = async () => {
    const attendanceData = students.map((student) => ({
      studentId: student.id,
      name: student.name,
      email: student.email,
      grade: selectedGrade,
      date: selectedDate,
      status: attendanceRecords[student.id] || "Absent",
    }));

    try {
     
      for (const record of attendanceData) {
        const userDocRef = doc(db, "users", record.studentId);
        await updateDoc(userDocRef, {
          attendance: {
            [selectedDate]: record.status,
          },
        });
      }

      
      for (const record of attendanceData) {
        await sendEmail(record.email, record.name, record.date, record.status);
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error submitting attendance:", error);
    }
  };

  return (
    <div className="attendanceMarking__container">
      <Sidebar className="attendanceMarking__sidebar" />
      <div className="attendanceMarking__content">
        <h1>Mark Student Attendance</h1>
        {showSuccessMessage && <Alert variant="success">Attendance submitted successfully!</Alert>}
        <Form.Group controlId="dateSelect" className="my-3">
          <Form.Label>Select Date</Form.Label>
          <Form.Control type="date" value={selectedDate} onChange={handleDateChange} />
        </Form.Group>
        {isToday && (
          <Form.Group controlId="gradeSelect" className="my-3">
            <Form.Label>Select Grade</Form.Label>
            <Form.Control as="select" value={selectedGrade} onChange={handleGradeChange}>
              <option value="">Select a Grade</option>
              {[...Array(13).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Grade {i + 1}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}
        {selectedGrade && isToday && (
          <div className="attendance-section">
            <h2>Mark Attendance for Grade {selectedGrade}</h2>
            {loading ? (
              <p>Loading students...</p>
            ) : (
              <Table striped bordered hover className="attendanceMarking__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>
                        <Form.Control
                          as="select"
                          value={attendanceRecords[student.id]}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                        >
                          <option value="Absent">Absent</option>
                          <option value="Present">Present</option>
                        </Form.Control>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Button variant="success" className="mt-3" onClick={handleSubmitAttendance}>
              Submit Attendance
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceMarking;