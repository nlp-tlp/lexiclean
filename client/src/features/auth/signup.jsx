import React, { useState, useContext } from "react";
import "./Auth.css";
import axios from "../utils/api-interceptor";
import history from "../utils/history";
import { AuthContext } from "./authcontext";
import { Formik } from "formik";
import * as yup from "yup";
import { Card, Form, Button, Col, Alert } from "react-bootstrap";
import SignUpImage from "../../media/signup.jpeg";

const schema = yup.object().shape({
  username: yup.string().required(),
  password: yup
    .string()
    .required()
    .min(5, "Password must be at least 5 characters long")
});

export const SignUp = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [, setIsAuthenticated] = useContext(AuthContext);

  const signupUser = async (values, handleReset) => {
    if (formSubmitted === false) {
      await axios
        .post("/api/auth/signup", values)
        .then((response) => {
          if (response.status === 200) {
            setIsAuthenticated(true);
            window.localStorage.setItem("token", response.data.token);
            window.localStorage.setItem("username", values.username);
            setFormSubmitted(true);
            history.push("/feed");
          }
        })
        .catch((error) => {
          if (error.response.status === 409) {
            setFormSubmitted(false);
            setShowAlert(true);
            handleReset();
          }
        });
    }
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
          <p>Username already exists.</p>
        </Alert>
      ) : null}

      <Card id="signup-card">
        <Card.Img src={SignUpImage} />
        <Card.Body>
          <Card.Title>Welcome! Sign up to begin</Card.Title>
          <Formik
            validationSchema={schema}
            onSubmit={(values) => signupUser(values)}
            initialValues={{
              username: "",
              email: "",
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
                <Form.Row>
                  <Form.Group as={Col} md="12" controlId="validationFormik02">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Email Address (Optional)"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      autoComplete="off"
                      isValid={touched.email && !errors.email}
                      isInvalid={touched.email && errors.email}
                    />
                    <Form.Text className="text-muted">
                      We'll never share your email with anyone else.
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Button type="submit" variant="dark">
                  Sign Up
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
