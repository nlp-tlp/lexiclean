import React, { useState } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap';
import axios from "../../common/utils/api-interceptor";
import history from "../../common/utils/history";

export default function DeleteProjectModal({showProjectDelete, setShowProjectDelete, selectedProject}) {
    const [valueMatched, setValueMatched] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const checkValueMatch = (value) => {
        setValueMatched(value === selectedProject.name)
    };

    console.log(selectedProject);

    const deleteProject =  async () => {
        setIsDeleting(true);
        await axios.delete(`/api/project/${selectedProject._id}`)
                .then(response => {
                        if (response.status === 200){
                        setIsDeleting(false);
                        setShowProjectDelete(false);
                        }
                    })
                    .catch(error => {
                        if (error.response.status === 401 || 403){
                            console.log('unauthorized')
                            history.push('/unauthorized');
                        }
                    });
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
                {
                    isDeleting ? 
                    <div style={{textAlign: 'center', margin: 'auto', marginTop: '4em', marginBottom: '4em'}}>
                        <p style={{fontSize: '18px'}}>Deleting project - this may take a minute...</p>
                        <Spinner animation="border" />
                    </div>
                    :
                    <div>
                    <p>Please enter <strong>{ selectedProject.name }</strong> in the field below to delete this project:</p>
                    <div style={{textAlign: 'center'}}>
                        <input
                            type="text"
                            placeholder="Enter project name here"
                            onChange={e => checkValueMatch(e.target.value)}
                            style={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)', border: 'none', outline: 'none', padding: '0.5em', borderRadius: '0.5em'}}
                        />
                    </div>
                    </div>
                }
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowProjectDelete(false)}>Cancel</Button>
                <Button variant="danger" disabled={ !valueMatched } onClick={() => deleteProject()}>Delete</Button>
            </Modal.Footer>
        </Modal>
    )
}
