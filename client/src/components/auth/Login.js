import React, { useState } from 'react'
import { createUseStyles } from 'react-jss';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import LoginImage from '../images/login.jpeg'
import { useHistory } from 'react-router-dom'


const useStyles = createUseStyles({
    card: {
        width: '20em',
        margin: 'auto',
        marginTop: '5vh'
    }
})

export default function Login({ token, setToken }) {
    const history = useHistory();
    const classes = useStyles();

    const [username, setUserName] = useState();
    const [password, setPassword] = useState();

    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState();

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        await axios.post('/api/auth/login', { username: username, password: password })
        .then(response => {
            console.log(response);
            if (response.status === 200){
                setToken(response.data.token);
                history.push("/feed");
            }
        })
        .catch(error => {
            if (error.response.status === 409){
                console.log(error);
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
        <Card
            className={classes.card}
        >
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
        </>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
  }