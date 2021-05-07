import React from 'react'
import { Modal, Button } from 'react-bootstrap';

export default function AnnotateBeginModal({showAnnotate, setShowAnnotate, setLoadAnnotationView}) {

    const confirmationAction = () => {
        setLoadAnnotationView(true);
        setShowAnnotate(false);
    }

    return (
        <Modal
            show={showAnnotate}
            onHide={() => setShowAnnotate(false)}
            backdrop="static"
            keyboard={false}
            style={{}}
        >
            <Modal.Header closeButton>
                <Modal.Title>Load Project</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Are you sure you want to load this project and commence annotating?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAnnotate(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => confirmationAction()}>Yes</Button>
            </Modal.Footer>
        </Modal>
    )
}
