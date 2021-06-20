import React, { useState } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';
import { createUseStyles } from 'react-jss';
import { Card, Form, Button } from 'react-bootstrap';
import LoginImage from '../images/login.jpeg'
import { useHistory, Redirect } from 'react-router-dom'
import useToken from './useToken'


const useStyles = createUseStyles({
    loginWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        margin: 'auto'
    }
})

const loginUser = async ({username, password}) => {

    const response = await axios.post(`/api/auth/login`, {username: username, password: password });
    console.log(response.data);
    return response.data;
}

export default function Login({ token, setToken }) {
    const classes = useStyles();
    const history = useHistory();

    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const loginResponse = await loginUser({
            username,
            password
        });
        setToken(loginResponse.token);
        history.push("/feed")
    }
    
    return (
        <Card style={{width: '40vw', margin: 'auto', marginTop: '25vh'}}>
            <Card.Img src={LoginImage}/>
            <Card.Body>
                <Card.Title>
                    Log In to Lexiclean
                </Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                onChange={e => setUserName(e.target.value)}
                                />
                        </Form.Group>
                        <Form.Group>
                        <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                onChange={e => setPassword(e.target.value)}
                                />
                        </Form.Group>
                        <Button variant="primary" type="submit">Log in</Button>
                    </Form>
            </Card.Body>
                    <a href="/" className="text-muted" style={{margin: '1em'}}>
                        Return to landing page
                    </a>
        </Card>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
  }