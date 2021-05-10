import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap';

export default function SettingsModal({showSettings, setShowSettings, pageLimit, setPageLimit}) {

    const [selectedLimit, setSelectedLimit] = useState(pageLimit);

    const submitHandler = () => {
        setPageLimit(selectedLimit);
        setShowSettings(false);
    }

    return (
        <Modal
            show={showSettings}
            onHide={() => setShowSettings(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Update Settings</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Page limit {selectedLimit}</p>
                <Form>
                    <Form.Group controlId="formBasicRange">
                        <Form.Control
                            type="range"
                            value={selectedLimit}
                            onChange={(e) => setSelectedLimit(e.target.value)}
                            step={10}
                            min={10}
                            max={250}
                            tooltipLabel={currentValue => `${currentValue}`}
                            tooltip='on'
                        />
                    </Form.Group>
                </Form>


            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => submitHandler()}>Update</Button>
            </Modal.Footer>
        </Modal>
    )
}
