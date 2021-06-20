import React from 'react'
import { Modal } from 'react-bootstrap';
import SignUpForm from '../forms/SignUpForm'

export default function DeleteProjectModal({ showSignUp, setShowSignUp}) {

    return (
        <Modal
            show={showSignUp}
            onHide={() => setShowSignUp(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Sign Up</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <SignUpForm setShowSignUp={setShowSignUp}/>
            </Modal.Body>

        </Modal>
    )
}
