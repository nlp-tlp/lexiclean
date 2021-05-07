import React from 'react'
import { Modal, Button } from 'react-bootstrap';

export default function DownloadModal({showDownload, setShowDownload}) {
    return (
        <Modal
            show={showDownload}
            onHide={() => setShowDownload(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Download Results</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Modal body text goes here.</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDownload(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setShowDownload(false)}>Download</Button>
            </Modal.Footer>
        </Modal>
    )
}
