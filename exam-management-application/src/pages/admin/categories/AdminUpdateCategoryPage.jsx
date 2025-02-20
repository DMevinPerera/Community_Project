import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminUpdateCategoryPage.css";
import { Button, Form } from "react-bootstrap";
import swal from "sweetalert";
import FormContainer from "../../../components/FormContainer";
import Sidebar from "../../../components/Sidebar";
import { db } from "../../../config/firebase";
import { doc, getDoc, updateDoc} from "firebase/firestore";


const AdminUpdateCategoryPage = () => {
 
  const params = useParams();
  const navigate = useNavigate();
  const { catId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  

 


  // useEffect(() => {
  //   if (!oldCategory) {
  //     swal("Category Not Found", "This category does not exist.", "error");
  //     navigate("/adminCategories");
  //   }
  // }, [oldCategory, navigate]);

  


  

  useEffect(() => {
    const fetchCategory = async () => {
      const docRef = doc(db, "categories", catId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTitle(docSnap.data().title);
        setDescription(docSnap.data().description);
      } else {
        swal("Error", "Category not found", "error");
        navigate("/adminCategories");
      }
    };
    fetchCategory();
  }, [catId, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "categories", catId), { title, description });
    swal("Updated!", "Category updated successfully", "success");
    navigate("/adminCategories");
  };

  return (
    <div className="adminUpdateCategoryPage__container">
      <div className="adminUpdateCategoryPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminUpdateCategoryPage__content">
        <FormContainer>
          <h2>Update Category</h2>
          <Form onSubmit={submitHandler}>
            <Form.Group className="my-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="my-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                style={{ textAlign: "top" }}
                as="textarea"
                rows="5"
                type="text"
                placeholder="Enter Category Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              ></Form.Control>
            </Form.Group>

            <Button
              className="my-3 adminUpdateCategoryPage__content--button"
              type="submit"
              variant=""
            >
              Update
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  );
};

export default AdminUpdateCategoryPage;