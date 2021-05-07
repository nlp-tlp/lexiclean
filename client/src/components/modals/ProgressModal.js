import React from 'react'
import { Modal, Button } from 'react-bootstrap';

export default function ProgressModal({showProgress, setShowProgress}) {
    return (
        <Modal
            show={showProgress}
            onHide={() => setShowProgress(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Progress</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Modal body text goes here.</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={() => setShowProgress(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}
