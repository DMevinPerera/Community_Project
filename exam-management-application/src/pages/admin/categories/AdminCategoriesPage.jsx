import React, { useState, useEffect } from "react";
import "./AdminCategoriesPage.css";
import { useNavigate } from "react-router-dom";
import { Button, ListGroup } from "react-bootstrap";
import swal from "sweetalert";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";
import Sidebar from "../../../components/Sidebar";

const AdminCategoriesPage = () => {
  const navigate = useNavigate();

  // Simulate categories in local state
  const [categories, setCategories] = useState([]);
  
  // Simulate loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching categories
    setLoading(true);
    setTimeout(() => {
      setCategories([
        { catId: 1, title: "Category 1", description: "Description of Category 1" },
        { catId: 2, title: "Category 2", description: "Description of Category 2" }
      ]);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  const categoryClickHandler = (catId) => {
    navigate(`/adminQuizzes/?catId=${catId}`);
  };

  const addNewCategoryHandler = () => {
    navigate("/adminAddCategory");
  };

  const updateCategoryHandler = (event, category) => {
    event.stopPropagation();
    navigate(`/adminUpdateCategory/${category.catId}`);
  };

  const deleteCategoryHandler = (event, category) => {
    event.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this category!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        // Simulate deleting the category
        setCategories(categories.filter((cat) => cat.catId !== category.catId));
        swal(
          "Category Deleted!",
          `${category.title} successfully deleted`,
          "success"
        );
      } else {
        swal(`${category.title} is safe`);
      }
    });
  };

  return (
    <div className="adminCategoriesPage__container">
      <div className="adminCategoriesPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminCategoriesPage__content">
        <h2>Categories</h2>
        {loading ? (
          <Loader />
        ) : categories.length === 0 ? (
          <Message>No categories are present. Try adding some categories.</Message>
        ) : (
          categories.map((cat, index) => {
            return (
              <ListGroup
                className="adminCategoriesPage__content--categoriesList"
                key={index}
              >
                <ListGroup.Item
                  style={{ borderWidth: "0px" }}
                  className="d-flex"
                  onClick={() => categoryClickHandler(cat.catId)}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{cat.title}</div>
                    {cat.description}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      height: "90%",
                      margin: "auto 2px",
                    }}
                  >
                    <div
                      onClick={(event) => updateCategoryHandler(event, cat)}
                      style={{
                        margin: "2px 8px",
                        textAlign: "center",
                        color: "rgb(68 177 49)",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Update
                    </div>

                    <div
                      onClick={(event) => deleteCategoryHandler(event, cat)}
                      style={{
                        margin: "2px 8px",
                        textAlign: "center",
                        color: "red",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            );
          })
        )}
        <Button
          variant=""
          className="adminCategoriesPage__content--button"
          onClick={addNewCategoryHandler}
        >
          Add Category
        </Button>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;