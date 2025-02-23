import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import swal from "sweetalert";
import FormContainer from "../../../components/FormContainer";
import Sidebar from "../../../components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../config/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

import "./AdminAddQuestionsPage.css";

const AdminAddQuestionsPage = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const quizId = params.get("quizId");
  const categoryId = params.get("categoryId");

  if (!quizId || !categoryId) {
    swal("Error", "Quiz ID or Category ID is missing! Cannot add question.", "error");
    return null;
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "smart-tuition");
    data.append("cloud_name", "dlbvyir2f");

    try {
      setLoading(true);
      const res = await fetch("https://api.cloudinary.com/v1_1/dlbvyir2f/image/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const uploadedImage = await res.json();
      setImageUrl(uploadedImage.url);
      setLoading(false);
      swal("Success", "Image uploaded successfully!", "success");

    } catch (error) {
      console.error("Error uploading image:", error);
      swal("Error", "Image upload failed!", "error");
      setLoading(false);
    }
  };

  const onSelectAnswerHandler = (e) => {
    setAnswer(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!content && !imageUrl) {
      swal("Invalid Input", "Either text or an image is required for the question!", "error");
      return;
    }

    if (!option1 || !option2 || !option3 || !option4 || !answer || answer === "n/a") {
      swal("Invalid Input", "All fields are required!", "error");
      return;
    }

    try {
      
      
      const questionsRef = collection(db, "categories", categoryId, "quizzes", quizId, "questions");
      const snapshot = await getDocs(questionsRef);
      const currentQuestionsCount = snapshot.docs.length; 
      const newQuestion = {
        content: content || null,
        image: imageUrl || null,
        options: { option1, option2, option3, option4 },
        answer,
      };

     
      await addDoc(questionsRef, newQuestion);

      swal("Success", "Question added successfully!", "success");

    
      setContent("");
      setImage(null);
      setImageUrl(null);
      setOption1("");
      setOption2("");
      setOption3("");
      setOption4("");
      setAnswer("");

      
      navigate(`/adminQuestions/?quizId=${quizId}&categoryId=${categoryId}`);
    } catch (error) {
      console.error("Error adding question to Firestore:", error);
      swal("Error", "Failed to add the question.", "error");
    }
  };

  return (
    <div className="adminAddQuestionPage__container">
      <div className="adminAddQuestionPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminAddQuestionPage__content">
        <FormContainer>
          <h2>Add Question</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="content">
              <Form.Label>Question (Text)</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                placeholder="Enter Question Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="my-3" controlId="image">
              <Form.Label>Upload Image (Optional)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
              {loading && <p>Uploading image...</p>}
              {imageUrl && (
                <div className="my-3">
                  <img src={imageUrl} alt="Uploaded" style={{ width: "100%", height: "auto", borderRadius: "8px" }} />
                </div>
              )}
            </Form.Group>

            {[option1, option2, option3, option4].map((opt, index) => (
              <Form.Group key={index} className="my-3">
                <Form.Label>{`Option ${index + 1}`}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="2"
                  placeholder={`Enter Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => {
                    switch (index) {
                      case 0:
                        setOption1(e.target.value);
                        break;
                      case 1:
                        setOption2(e.target.value);
                        break;
                      case 2:
                        setOption3(e.target.value);
                        break;
                      case 3:
                        setOption4(e.target.value);
                        break;
                      default:
                        break;
                    }
                  }}
                />
              </Form.Group>
            ))}

            <Form.Group className="my-3">
              <Form.Label>Choose Correct Option:</Form.Label>
              <Form.Select aria-label="Choose Correct Option" onChange={onSelectAnswerHandler} value={answer}>
                <option value="n/a">Choose Option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </Form.Select>
            </Form.Group>

            <Button className="my-5 adminAddQuestionPage__content--button" type="submit" variant="primary">
              Add Question
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminAddQuestionsPage;
