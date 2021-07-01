import React from 'react'
import { useHistory } from 'react-router-dom'
import useToken from './useToken'
import { Button } from 'react-bootstrap';

export default function Logout() {
    const history = useHistory();
    const { token, setToken } = useToken();
    
    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("id");
        localStorage.removeItem("replacements");
        history.push("/");
    };
    
    return (
        <Button variant="light" onClick={logout}>
            Logout
        </Button>
    )
}
