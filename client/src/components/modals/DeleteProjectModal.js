import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

export default function DeleteProjectModal({showProjectDelete, setShowProjectDelete, selectedProject}) {
    const [valueMatched, setValueMatched] = useState(false);
    const checkValueMatch = (value) => {
        setValueMatched(value === selectedProject.name)
    };

    const deleteProject =  async () => {
        const response = await axios.delete(`/api/project/${selectedProject._id}`);
        if (response.status === 200){
            console.log('Project deleted successfully');
            setShowProjectDelete(false);
        }
    }

    return (
        <Modal
            show={showProjectDelete}
            onHide={() => setShowProjectDelete(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Delete project</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>
                    Please enter <strong>{ selectedProject.name }</strong> in the field below to delete this project:
                </p>
                <div style={{textAlign: 'center'}}>
                    <input
                        type="text"
                        placeholder="Enter project name here"
                        onChange={e => checkValueMatch(e.target.value)}
                        style={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)', border: 'none', outline: 'none', padding: '0.5em', borderRadius: '0.5em'}}
                    />
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowProjectDelete(false)}>Cancel</Button>
                <Button variant="danger" disabled={ !valueMatched } onClick={() => deleteProject()}>Download</Button>
            </Modal.Footer>
        </Modal>
    )
}
