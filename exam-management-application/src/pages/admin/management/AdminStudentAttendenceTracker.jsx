import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminStudentAttendenceTracker.css";

const AdminStudentAttendenceTracker = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); 

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream; 
      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
      sendImageToBackend(imageDataUrl);
    }
  };

  const sendImageToBackend = async (imageDataUrl) => {
    try {
      const blob = await fetch(imageDataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "captured_image.jpg");

      const response = await axios.post("http://localhost:5000/check_faces", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server response:", response.data.predicted_name);

      const recognizedName = response.data.predicted_name;

      
      const isDuplicate = attendanceRecords.some((record) => record.name === recognizedName);

      if (isDuplicate) {
        toast.error(`❌ ${recognizedName} is already marked present!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        const newRecord = {
          name: recognizedName,
          grade: selectedGrade,
          status: "Present",
          time: new Date().toLocaleTimeString(),
        };

        setAttendanceRecords((prevRecords) => [...prevRecords, newRecord]);

        toast.success(`✅ ${recognizedName} marked present!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      toast.error("❌ Error recognizing face!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); 
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
                <br/><Button variant="success" className="mt-2" onClick={handleCapture}>Capture</Button>
                <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
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

        <ToastContainer />
      </div>
    </div>
  );
};

export default AdminStudentAttendenceTracker;