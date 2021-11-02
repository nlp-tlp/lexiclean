import React, { useState, useContext } from "react";
import "./Auth.css";
import { AuthContext } from "./authcontext";
import history from "../utils/history";
import axios from "../utils/api-interceptor";
import { setUsername } from "./userSlice";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Card, Form, Button, Alert, Col } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import LoginImage from "../../media/login.jpeg";

const schema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
});

export const Login = () => {
  const dispatch = useDispatch();
  const [, setIsAuthenticated] = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState();

  const handleSubmit = async (values) => {
    await axios
      .post("/api/auth/login", {
        username: values.username,
        password: values.password,
      })
      .then((response) => {
        if (response.status === 200) {
          setIsAuthenticated(true);
          window.localStorage.setItem("token", response.data.token);
          window.localStorage.setItem("username", values.username);
          dispatch(setUsername(values.username));
          history.push("/feed");
        }
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setAlertText(error.response.data.error);
          setShowAlert(true);
        }
      });
  };

  return (
    <>
      <img
        className="main-bg"
        src="https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        alt="main-background"
        style={{ opacity: "0.5" }}
      />
      {showAlert ? (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          <Alert.Heading>Oops!</Alert.Heading>
          <p>{alertText}</p>
        </Alert>
      ) : null}
      <Card id="login-card">
        <Card.Img src={LoginImage} />
        <Card.Body>
          <Card.Title>Login to LexiClean</Card.Title>
          <Formik
            validationSchema={schema}
            onSubmit={(values) => handleSubmit(values)}
            initialValues={{
              username: "",
              password: "",
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isValid,
              errors,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Row>
                  <Form.Group as={Col} md="12" controlId="validationFormik01">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Username"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      autoComplete="off"
                      isValid={touched.username && !errors.username}
                      isInvalid={touched.username && errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} md="12" controlId="validationFormik03">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      autoComplete="off"
                      isValid={touched.password && !errors.password}
                      isInvalid={touched.password && errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Button variant="dark" type="submit">
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
        <a href="/" className="text-muted" id="return-button">
          Return to landing page
        </a>
      </Card>
    </>
  );
};

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};
