import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Form, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

import useToken from '../auth/useToken'

const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    email: yup.string().required()
  });
  
export default function SignUpForm({ setShowSignUp }) {
    const history = useHistory();
    const { token, setToken } = useToken();

    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const signupUser = async (values) => {
          console.log('form payload', values)

          if (formSubmitted === false){
            console.log('submitting...');
            const response = await axios.post('/api/auth/signup', values);

            if (response.status === 200){
              console.log(response);
              setToken(response.data.token)
              setFormSubmitted(true);
              setShowSignUp(false);

              // TODO: implement redirect to /feed on signup success
              // setTimeout(() => {
              //   history.push("/feed");
              // }, 1000);

            }
          }
    }

    return (
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
                isValid={touched.username && !errors.username}
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
                type="text"
                placeholder="Enter Email Address"
                name="email"
                value={values.email}
                onChange={handleChange}
                isValid={touched.email && !errors.email}
              />
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
                isValid={touched.password && !errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Button type="submit">Sign Up</Button>
        </Form>
      )}
    </Formik>
    )
}
