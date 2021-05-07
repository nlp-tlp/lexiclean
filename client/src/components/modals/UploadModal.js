import React from 'react'
import { Modal } from 'react-bootstrap';

import UploadForm from '../forms/UploadForm';

export default function UploadModal({showUpload, setShowUpload}) {
    return (
        <Modal
            show={showUpload}
            onHide={() => setShowUpload(false)}
            backdrop="static"
            keyboard={false}
            style={{}}
        >
            <Modal.Header closeButton>
                <Modal.Title>Upload Dataset</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>To begin annotating, project details must be specified and data uploaded</p>

                <UploadForm 
                    setShowUpload={setShowUpload}
                />

            </Modal.Body>
        </Modal>
    )
}
