import React, { useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import UploadForm from '../forms/UploadForm';

const useStyles = createUseStyles({
    model: {
        width: '50%'
    },
})

export default function UploadModal({showUpload, setShowUpload}) {
    const classes = useStyles();

    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
        <Modal
            show={showUpload}
            onHide={() => setShowUpload(false)}
            backdrop="static"
            keyboard={false}
            dialogClassName={classes.modal}
        >
            <Modal.Header closeButton>
                <Modal.Title>Create Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    isSubmitting ?
                    <div style={{textAlign: 'center', margin: 'auto', marginTop: '4em', marginBottom: '4em'}}>
                        <p style={{fontSize: '18px'}}>Creating project - this may take a moment...</p>
                        <Spinner animation="border" />
                    </div>
                    :
                    <div>
                        <p>Please enter the following details to commence your project</p>
                        <UploadForm 
                            setShowUpload={setShowUpload}
                            setIsSubmitting={setIsSubmitting}
                        />
                    </div>
                }
            </Modal.Body>
        </Modal>
    )
}
