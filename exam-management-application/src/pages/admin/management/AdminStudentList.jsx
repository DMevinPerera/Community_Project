import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "./AdminStudentList.css"; // Add styles to ensure responsiveness

const AdminStudentList = () => {
  const [students, setStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    setStudents([
      { id: 1, firstName: "John", lastName: "Doe", grade: "10", phone: "1234567890", admissionNumber: "A001", status: "Pending" },
      { id: 2, firstName: "Jane", lastName: "Smith", grade: "11", phone: "0987654321", admissionNumber: "A002", status: "Approved" },
    ]);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((student) => student.id !== id));
    }
  };

  const handleUpdate = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleSaveChanges = () => {
    setStudents(
      students.map((s) => (s.id === selectedStudent.id ? selectedStudent : s))
    );
    setShowModal(false);
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
              <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
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
              .filter((student) => (gradeFilter ? student.grade === gradeFilter : true))
              .map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.grade}</td>
                  <td>{student.phone}</td>
                  <td>{student.admissionNumber}</td>
                  <td>{student.status}</td>
                  <td>
                    <Button variant="info" className="mx-2" onClick={() => handleUpdate(student)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(student.id)}>
                      <FaTrash />
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
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, firstName: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.lastName}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, lastName: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Grade</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedStudent.grade}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, grade: e.target.value })}
                >
                  {[...Array(13).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.phone}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Admission Number</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStudent.admissionNumber}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, admissionNumber: e.target.value })}
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
