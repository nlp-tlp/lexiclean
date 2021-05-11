import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    legend: {
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.25em',
        justifyContent: 'space-between',
    },
    legendItem: {
        textAlign: 'center',
        width: '8em',
        margin: '0.5em',
        borderRadius: '0.25em',
        padding: '0.2em'
    },
})


// TODO: Add all of these into legend container
// 'ds': 'red',
// 'ab': 'purple',
// 'ew': '#D9D9D9',
// 'no': 'blue',
// 'un': 'brown', 
// 'rp': 'yellow',
// 'rt': '#99BF9C',
// 'st': '#6BB0BF',
// 'stm': 'aqua',
// 'ua': '#F2A477',

export default function LegendModal({showLegend, setShowLegend}) {
    const classes = useStyles();

    return (
        <Modal
            show={showLegend}
            onHide={() => setShowLegend(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Legend</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            <div style={{display: 'flex', flexDirection: 'column', textAlign: 'center', backgroundColor: 'white'}}>
                            <div className={classes.legend}>
                                <div className={classes.legendItem} style={{backgroundColor: '#F2A477'}}>
                                    Candidate
                                </div>
                                <div className={classes.legendItem} style={{backgroundColor: '#99BF9C'}}>
                                    Replaced
                                </div>
                                <div className={classes.legendItem} style={{backgroundColor: '#D9D9D9'}}>
                                    Normalised
                                </div>
                                <div className={classes.legendItem} style={{backgroundColor: '#6BB0BF'}}>
                                    Suggestion
                                </div>
                                <div className={classes.legendItem} style={{backgroundColor: '#8F8EBF'}}>
                                    Meta Suggestion
                                </div>
                            </div>
                        </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowLegend(false)}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    )
}
