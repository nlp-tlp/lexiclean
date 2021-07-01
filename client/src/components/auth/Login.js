import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Card, Form, Button, Alert, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom'
import { Formik } from 'formik';
import * as yup from 'yup';

import LoginImage from '../images/login.jpeg'

const useStyles = createUseStyles({
    card: {
        width: '25em',
        margin: 'auto',
        marginTop: '5vh'
    }
})


const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required()
});

export default function Login({ token, setToken }) {
    const history = useHistory();
    const classes = useStyles();

    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState();
    
    const handleSubmit = async (values) => {
        
        await axios.post('/api/auth/login', { username: values.username, password: values.password })
        .then(response => {
            if (response.status === 200){
                localStorage.setItem('username', values.username);
                setToken(response.data.token);
                history.push("/feed");
            }
        })
        .catch(error => {
            if (error.response.status === 409){
                setAlertText(error.response.data.error);
                setShowAlert(true);
            }
        });
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
                <p>
                    {alertText}
                </p>
            </Alert>
        : null}
        <Card className={classes.card}>
            <Card.Img src={LoginImage}/>
            <Card.Body>
                <Card.Title>
                    Log In to LexiClean
                </Card.Title>
                    <Formik
                        validationSchema={schema}
                        onSubmit={(values) => handleSubmit(values)}
                        initialValues={{
                            username: '',
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
                            <Button variant="dark" type="submit">Login</Button>
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

Login.propTypes = {
    setToken: PropTypes.func.isRequired
  }