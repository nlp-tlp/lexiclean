import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { Card, Form, Button, Col, Alert } from 'react-bootstrap';
import SignUpImage from '../images/signup.jpeg'

const useStyles = createUseStyles({
    card: {
        width: '25em',
        margin: 'auto',
        marginTop: '5vh'
    }
})

const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    email: yup.string().email().required()
  });

export default function SignUp({ token, setToken }) {
    const history = useHistory();
    const classes = useStyles();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    
    const signupUser = async (values, handleReset) => {
          if (formSubmitted === false){
            await axios.post('/api/auth/signup', values)
                        .then(response => {
                            if (response.status === 200){
                                localStorage.setItem('username', values.username);
                                setToken(response.data.token)
                                setFormSubmitted(true);
                                history.push("/feed");
                            }
                        })
                        .catch(error => {
                            if (error.response.status === 409){
                                setFormSubmitted(false);
                                setShowAlert(true);
                                handleReset();
                            }
                        });
            }
    }
     
    return (
        <>
        {showAlert ? 
            <Alert
                variant="danger"
                onClose={() => setShowAlert(false)}
                dismissible
            >
                <Alert.Heading>Oops!</Alert.Heading>
                <p>Username already exists.</p>
            </Alert>
        : null}

        <Card className={classes.card}>
            <Card.Img src={SignUpImage}/>
            <Card.Body>
                <Card.Title>
                    Welcome! Sign up to begin
                </Card.Title>
                <Formik
                    validationSchema={schema}
                    onSubmit={(values) => signupUser(values)}
                    initialValues={{
                        username: '',
                        email: '',
                        password: ''
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
                                    autoComplete = 'off'
                                    isValid={touched.username && !errors.username}
                                    isInvalid={touched.username && errors.username}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.username}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} md="12" controlId="validationFormik02">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Email Address"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    autoComplete = 'off'
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
                        <Form.Row>
                            <Form.Group as={Col} md="12" controlId="validationFormik03">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter Password"
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    autoComplete = 'off'
                                    isValid={touched.password && !errors.password}
                                    isInvalid={touched.password && errors.password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>
                        <Button type="submit" variant="dark">Sign Up</Button>
                        </Form>
                    )}
                    </Formik>
            </Card.Body>
            <a href="/" className="text-muted" style={{margin: '1em'}}>
                Return to landing page
            </a>
        </Card>
        </>
    )
}