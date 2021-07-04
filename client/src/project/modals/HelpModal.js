import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import QRG from '../../common/media/QRG_lexiclean.png';

const useStyles = createUseStyles({
    modal: {
        'width': '90vw',
        'minWidth': '90vw'
    }
})

export default function HelpModal({ showHelp, setShowHelp }) {
    const classes = useStyles();
    return (
        <Modal
            show={showHelp}
            onHide={() => setShowHelp(false)}
            dialogClassName={classes.modal}
        >
            <Modal.Header closeButton>
                <Modal.Title>LexiClean - Quick Reference Guide (QRG)</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{margin: 'auto'}}>
                <img src={QRG} alt="LexiClean Quick Reference Guide" style={{maxWidth: '80vw'}}/>
                <p style={{fontWeight: 'bold', fontSize: '22px'}}>Guide</p>
                <p>1. <strong>Project save button</strong>: Changes colour when changes are detected.</p>
                <p>2. <strong>Annotation metrics</strong>: Indicates the current state of annotation.</p>
                <p>3. <strong>Project menu</strong>: Context menu for project that includes i. token colour legend, 
                ii. result download, iii. schema modification and activations, and iv. Annotation window settings.</p>
                <p>4. <strong>Tokenization mode button</strong>: Changes text into tokenization mode.</p>
                <p>5. <strong>Text tokenization mode</strong>: Allows tokens to be modified by clicking adjoining tokens and applying the tokenization.</p>
                <p>6. <strong>Text normalisation mode</strong>: Allows tokens to be replaced in situ and meta tags to be assigned by right clicking on tokens.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={() => setShowHelp(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}
