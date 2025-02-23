import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import swal from "sweetalert";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { storage, db } from "../../../config/firebase"; // Ensure Firebase Storage and Firestore are correctly initialized
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import FormContainer from "../../../components/FormContainer";
import Sidebar from "../../../components/Sidebar";
import "./AdminUpdateQuestionPage.css";

const AdminUpdateQuestionPage = () => {
  const navigate = useNavigate();
  const { categoryId, quizId, quesId } = useParams(); 
  const location = useLocation(); 

  const queryParams = new URLSearchParams(location.search);
  const quizTitle = queryParams.get("quizTitle");

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); 
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [answer, setAnswer] = useState("");
  const [contentType, setContentType] = useState("text"); 

  useEffect(() => {
    if (!categoryId || !quizId || !quesId) {
      swal("Error", "Invalid parameters!", "error");
      return;
    }
  
    const fetchData = async () => {
      try {
        const docRef = doc(db, "categories", categoryId, "quizzes", quizId, "questions", quesId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const questionData = docSnap.data();
          setContent(questionData.content || "");
          setImage(questionData.image || ""); 
          setOption1(questionData.options?.option1 || "");
          setOption2(questionData.options?.option2 || "");
          setOption3(questionData.options?.option3 || "");
          setOption4(questionData.options?.option4 || "");
          setAnswer(questionData.answer || "");
        } else {
          swal("Error", "Question not found!", "error");
        }
      } catch (error) {
        swal("Error", `Failed to fetch question: ${error.message}`, "error");
      }
    };
  
    fetchData();
  }, [categoryId, quizId, quesId]);
  
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const uploadImage = async () => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `questionImages/${Date.now()}-${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
         
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (!categoryId || !quizId || !quesId) {
      swal("Error", "Invalid question ID", "error");
      return;
    }
  
    try {
      let imageURL = image ? await uploadImage() : ""; 
  
      const docRef = doc(db, "categories", categoryId, "quizzes", quizId, "questions", quesId);
      await updateDoc(docRef, {
        content,
        image: imageURL || image, 
        options: {
          option1,
          option2,
          option3,
          option4
        },
        answer,
      });
  
      swal("Success!", "Question updated successfully!", "success");
      navigate(`/adminQuestions/?quizId=${quizId}&categoryId=${categoryId}&quizTitle=${quizTitle}`);
    } catch (error) {
      swal("Error", `Failed to update question: ${error.message}`, "error");
    }
  };
  

  return (
    <div className="adminUpdateQuestionPage__container">
      <div className="adminUpdateQuestionPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminUpdateQuestionPage__content">
        <FormContainer>
          <h2>Update Question</h2>
          <Form onSubmit={submitHandler}>
            {contentType === "text" ? (
              <Form.Group className="my-3" controlId="content">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  style={{ textAlign: "top" }}
                  as="textarea"
                  rows="3"
                  type="text"
                  placeholder="Enter Question Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Form.Group>
            ) : (
              <Form.Group className="my-3" controlId="image">
                <Form.Label>Upload Question Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Form.Group>
            )}

            <Form.Group className="my-3" controlId="option1">
              <Form.Label>Option 1</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option2">
              <Form.Label>Option 2</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option3">
              <Form.Label>Option 3</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="option4">
              <Form.Label>Option 4</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </Form.Group>

            <div className="my-3">
              <label htmlFor="answer-select">Choose Correct Option:</label>
              <Form.Select
                id="answer-select"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              >
                <option value="">Choose Option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </Form.Select>
            </div>

            <Button className="my-5" type="submit" variant="primary">
              Update
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminUpdateQuestionPage;
