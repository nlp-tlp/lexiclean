import React, { useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

export default function AnnotateBeginModal({ showAnnotate, setShowAnnotate, selectedProject }) {
    const history = useHistory();
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
    }, [inputRef]);
    const confirmationAction = () => {
        history.push(`/project/${selectedProject._id}/page/1`)
        setShowAnnotate(false);
    }
    return (
        <Modal
            show={showAnnotate}
            onHide={() => setShowAnnotate(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Annotate Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Load project and commence annotating?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAnnotate(false)}>Cancel</Button>
                <Button variant="dark" ref={inputRef} onClick={() => confirmationAction()}>Yes</Button>
            </Modal.Footer>
        </Modal>
    )
}
