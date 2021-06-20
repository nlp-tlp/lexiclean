import React from 'react'
import { useHistory } from 'react-router-dom'
import useToken from './useToken'
import { Button } from 'react-bootstrap';

export default function Logout() {
    const history = useHistory();
    const { token, setToken } = useToken();
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null)
        history.push("/");
    }
    return (
        <Button variant="light" onClick={logout}>
            Logout
        </Button>

    )
}
