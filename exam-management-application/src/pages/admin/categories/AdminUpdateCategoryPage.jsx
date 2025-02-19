import React, { useState, useEffect } from "react";
import "./AdminUpdateCategoryPage.css";
import { Button, Form } from "react-bootstrap";
import swal from "sweetalert";
import { useParams, useNavigate } from "react-router-dom";
import FormContainer from "../../../components/FormContainer";
import Sidebar from "../../../components/Sidebar";

const AdminUpdateCategoryPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const catId = params.catId;

  // Simulate categories data in local state
  const [categories, setCategories] = useState([
    { catId: 1, title: "Category 1", description: "Description of Category 1" },
    { catId: 2, title: "Category 2", description: "Description of Category 2" },
  ]);
  
  // Find the category to be updated
  const oldCategory = categories.find((cat) => cat.catId == catId);
  
  const [title, setTitle] = useState(oldCategory ? oldCategory.title : "");
  const [description, setDescription] = useState(
    oldCategory ? oldCategory.description : ""
  );

  useEffect(() => {
    if (!oldCategory) {
      swal("Category Not Found", "This category does not exist.", "error");
      navigate("/adminCategories");
    }
  }, [oldCategory, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Simulate category update
    const updatedCategory = { catId, title, description };
    
    // Update the category in the state
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.catId === catId ? updatedCategory : cat
      )
    );

    swal("Category Updated!", `${title} successfully updated`, "success");
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