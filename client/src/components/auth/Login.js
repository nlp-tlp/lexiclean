import React, { useState } from 'react'
import PropTypes from 'prop-types';
import { createUseStyles } from 'react-jss';
import axios from 'axios';


const useStyles = createUseStyles({
    loginWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
})

const loginUser = async ({username, password}) => {

    const response = await axios.post(`/api/auth/login`, {username: username, password: password });
    console.log(response.data);
    return response.data;
}

export default function Login({ setToken }) {
    const classes = useStyles();

    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
  
    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginResponse = await loginUser({
            username,
            password
        });
        setToken(loginResponse.token);
    }
    

    return (
        <div className={classes.loginWrapper}>
            <h1>Please Log In</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Username</p>
                    <input type="text" onChange={e => setUserName(e.target.value)}/>
                </label>
                <label>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)}/>
                </label>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
            
        </div>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
  }