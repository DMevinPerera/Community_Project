import React, { useState, useEffect } from "react";
import { Form, Button, Table, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "./AdminAttendenceMarking.css";

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

  const fetchStudentsForGrade = (grade) => {
    setLoading(true);
    setTimeout(() => {
      const mockStudents = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        { id: 3, name: "Alice Brown" },
      ];
      const initialAttendance = {};
      mockStudents.forEach((student) => {
        initialAttendance[student.id] = "Absent";
      });
      setStudents(mockStudents);
      setAttendanceRecords(initialAttendance);
      setLoading(false);
    }, 1000);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = () => {
    const attendanceData = students.map((student) => ({
      studentId: student.id,
      name: student.name,
      grade: selectedGrade,
      date: selectedDate,
      status: attendanceRecords[student.id] || "Absent",
    }));
    console.log("Submitting Attendance:", attendanceData);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
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
