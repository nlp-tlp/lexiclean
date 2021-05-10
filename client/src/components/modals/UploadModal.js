import React, { useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap';

import UploadForm from '../forms/UploadForm';

export default function UploadModal({showUpload, setShowUpload}) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
        <Modal
            show={showUpload}
            onHide={() => setShowUpload(false)}
            backdrop="static"
            keyboard={false}
            style={{}}
        >
            <Modal.Header closeButton>
                <Modal.Title>Create Project</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {
                    isSubmitting ?
                    <div style={{textAlign: 'center', margin: 'auto', marginTop: '4em', marginBottom: '4em'}}>
                        <p style={{fontSize: '18px'}}>Creating project - this may take a minute...</p>
                        <Spinner animation="border" />
                    </div>
                    :
                    <div>
                        <p>To begin annotating, project details and data must be uploaded.</p>
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
