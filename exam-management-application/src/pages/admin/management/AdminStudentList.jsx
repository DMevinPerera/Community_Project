
import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import "./AdminStudentList.css"; 

const AdminStudentList = () => {
  const [students, setStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    };
    fetchStudents();
  }, []);

  const handleApprove = async (id) => {
    const studentRef = doc(db, "users", id);
    await updateDoc(studentRef, { status: "approved" });
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
    );
  };

  const handleReject = async (id) => {
    const studentRef = doc(db, "users", id);
    await updateDoc(studentRef, { status: "rejected" });
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
    );
  };

  const handleSaveChanges = async () => {
    if (selectedStudent) {
      const studentRef = doc(db, "users", selectedStudent.id);
      await updateDoc(studentRef, {
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        grade: selectedStudent.grade,
        phoneNumber: selectedStudent.phoneNumber,
        admissionNumber: selectedStudent.admissionNumber,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudent.id ? selectedStudent : s))
      );

      setShowModal(false);
    }
  };

  return (
    <div className="adminStudentList__container">
      <div className="adminStudentList__sidebar">
        <Sidebar />
      </div>

      <div className="adminStudentList__content">
        <h1>Student List</h1>
        <Form.Group controlId="gradeFilter" className="my-3">
          <Form.Label>Filter by Grade</Form.Label>
          <Form.Control
            as="select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">All Grades</option>
            {[...Array(13).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                Grade {i + 1}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Grade</th>
              <th>Phone</th>
              <th>Admission No.</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter((student) =>
                gradeFilter ? student.grade === Number(gradeFilter) : true
              )
              .map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.grade}</td>
                  <td>{student.phoneNumber}</td>
                  <td>{student.admissionNumber}</td>
                  <td>{student.status}</td>
                  <td>
                    <Button
                      variant="success"
                      className="mx-2"
                      onClick={() => handleApprove(student.id)}
                      disabled={student.status === "approved"}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(student.id)}
                      disabled={student.status === "rejected"}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="info"
                      className="mx-2"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowModal(true);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <Form>
              <Form.Group className="my-2">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.firstName}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      firstName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.lastName}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      lastName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Grade</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedStudent.grade}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      grade: Number(e.target.value),
                    })
                  }
                >
                  {[...Array(13).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      Grade {i + 1}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.phoneNumber}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Admission Number</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.admissionNumber}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      admissionNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminStudentList;
