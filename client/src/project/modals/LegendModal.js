import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import axios from 'axios';

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


const DEFAULT_CLASSES = {
    'rp': 'Replaced token',
    'ua': 'Unassigned token',
    'st': 'Suggested token',
    'en': 'English token (in-vocabulary)'
};

export default function LegendModal({showLegend, setShowLegend, project}) {
    const classes = useStyles();

    const [bgColourMap, setBgColourMap] = useState();
    const [coloursLoaded, setColoursLoaded] = useState(false);

    useEffect(() => {
        const fetchProjectMaps = async () => {
          if (!coloursLoaded){
            // Fetch maps
            //console.log('fetching maps...');
            const response = await axios.get(`/api/map/${project._id}`)
            if (response.status === 200){
              setBgColourMap(response.data.colour_map);
              //console.log('colour map in legend ->', response.data.colour_map);
              setColoursLoaded(true);
            }
          }
        }
        fetchProjectMaps();
      }, [coloursLoaded])


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
                <p>
                    This legend indicates colours assigned classes/meta-tags that are used to conextualise tokens
                </p>
                {
                    coloursLoaded ?
                        <div style={{display: 'flex', flexDirection: 'column', textAlign: 'center', backgroundColor: 'white'}}>
                                        <div className={classes.legend}>
                                            {
                                                Object.keys(bgColourMap).map(key => (
                                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                                        <div className={classes.legendItem} style={{backgroundColor: bgColourMap[key]}}>
                                                            {key}
                                                        </div>
                                                        {
                                                            Object.keys(DEFAULT_CLASSES).includes(key) ?
                                                            <p style={{margin: 'auto'}}>
                                                                { DEFAULT_CLASSES[key] }
                                                            </p>
                                                            : null
                                                        }
                                                    </div>
                                                    ))
                                            }
                                        </div>
                                    </div>
                    :
                    <h2>Loading...</h2>

                }
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowLegend(false)}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    )
}
