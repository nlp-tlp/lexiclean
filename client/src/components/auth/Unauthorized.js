import React from 'react'
import { Card, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import UnauthorizedImage from '../images/unauthorized.jpeg';

export default function Unauthorized() {
    const history = useHistory();

    return (
        <Card style={{width: '40vw', margin: 'auto', marginTop: '25vh'}}>
            <Card.Img src={UnauthorizedImage}/>
            <Card.Body>
                <Card.Title>
                    Unable to Access Page (Unauthorized)
                </Card.Title>
                <Button
                    variant="primary"
                    onClick={() => history.push("/login")}
                >
                    Log In
                </Button>
                <div style={{marginTop: "1em"}}>
                    <a href="/" className="text-muted">
                        Return to Landing
                    </a>
                </div>
            </Card.Body>
        </Card>
    )
}
