import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "./AdminStudentAttendenceTracker.css";

const AdminStudentAttendenceTracker = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const videoRef = useRef(null);

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="attendanceMarking__container">
      <Sidebar className="attendanceMarking__sidebar" />

      <div className="attendanceMarking__content">
        <h1>Mark Attendance</h1>

        <Form.Group controlId="gradeSelect" className="my-3">
          <Form.Label>Select Grade</Form.Label>
          <Form.Control as="select" value={selectedGrade} onChange={handleGradeChange}>
            <option value="">Select a Grade</option>
            {[...Array(13).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
            ))}
          </Form.Control>
        </Form.Group>

        {selectedGrade && (
          <div className="camera-section">
            <Button variant="primary" onClick={handleStartCamera}>Start Camera</Button>
            {cameraActive && (
              <div className="attendanceMarking__camera-box">
                <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
              </div>
            )}
          </div>
        )}

        <Table striped bordered hover className="attendanceMarking__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No attendance records available</td>
              </tr>
            ) : (
              attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.name}</td>
                  <td>{record.grade}</td>
                  <td>{record.status}</td>
                  <td>{record.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AdminStudentAttendenceTracker;
