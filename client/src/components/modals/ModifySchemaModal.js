import React, { useState, useEffect } from 'react'
import { Modal, Button, ButtonGroup, ToggleButton, Col, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import axios from 'axios';
import { MdAddCircle, MdBrush } from 'react-icons/md';
import { CompactPicker } from 'react-color';

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

const DEFAULT_COLOUR = "#9B9B9B"
const DEFAULT_MAPS = ['rp', 'ua', 'st', 'en'];

export default function ModifySchemaModal({ showModifySchema,
                                            setShowModifySchema,
                                            project,
                                            schemaTrigger,
                                            setSchemaTrigger
                                        }) {
    const classes = useStyles();

    const [maps, setMaps] = useState();
    const [mapsLoaded, setMapsLoaded] = useState(false);

    const [tempMetaTag, setTempMetaTag] = useState('');
    const [tempColour, setTempColour] = useState(DEFAULT_COLOUR)

    useEffect(() => {
        const fetchProjectMaps = async () => {
          if (!mapsLoaded){
            const response = await axios.get(`/api/map/${project._id}`)
            if (response.status === 200){
                setMaps(response.data)
                console.log('map response ->', response.data);
                setMapsLoaded(true);
            }
          }
        }
        fetchProjectMaps();
      }, [mapsLoaded])


    const addMetaTag = async () => {
        const response = await axios.post('/api/map/', { project_id: project._id , type: tempMetaTag, colour: tempColour});
        if (response.status === 200){
            const updatedContents = {...maps.contents, [tempMetaTag]: response.data};
            setMaps(prevState => ({...prevState, contents: updatedContents}));
            setTempMetaTag('');
            setTempColour(DEFAULT_COLOUR);
            // Update page
            setSchemaTrigger(!schemaTrigger);
        }

    };

    const activateMap = async (key, status) => {
        const mapId = maps.contents[key]._id;
        const response = await axios.post(`/api/map/status/${mapId}`, { activeStatus: status});
        if (response.status === 200){
            const updatedContents = {...maps.contents, [key]: {...maps.contents[key], active: status}}
            setMaps(prevState => ({...prevState, contents: updatedContents}))
            // Update page
            setSchemaTrigger(!schemaTrigger);
        }
    };

    const popover = (
        <Popover id="popover-colour">
          <Popover.Title>
            Select Colour
            </Popover.Title>
          <Popover.Content>
            <CompactPicker
              color={tempColour}
              onChange={color => setTempColour(color.hex)}
              onChangeComplete={color => setTempColour(color.hex)}
            />
          </Popover.Content>
        </Popover>
      )

    return (
        <Modal
            show={showModifySchema}
            onHide={() => setShowModifySchema(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Modify Schema</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h5 style={{marginBottom: '0.5em', fontWeight: 'bold'}}>New Meta Tags</h5>
                <p>Here additional meta tags can be added</p>
                {
                    maps ? 
                <Table striped bordered hover>
                    <thead style={{textAlign: 'center'}}>
                        <tr>
                        <th>Name</th>
                        <th>Colour</th>
                        <th>Status</th>
                        <th>Add</th>
                        </tr>
                    </thead>
                    <tbody style={{textAlign: 'center'}}>
                        <tr>
                        <td>
                            <input
                                type="text"
                                style={{width: '8em'}}
                                value={tempMetaTag}
                                onChange={e => setTempMetaTag(e.target.value)}
                            />
                        </td>
                        <td>
                            <OverlayTrigger trigger="click" placement="left" overlay={popover}>
                            <Button style={{borderColor: tempColour, backgroundColor: tempColour, padding: '0.2em'}}>
                                <MdBrush/>
                            </Button>
                            </OverlayTrigger>
                        </td>
                        <td style={{fontWeight: 'bolder'}}>
                            Active
                        </td>
                        <td>
                            {
                                tempMetaTag !== '' ?
                                <MdAddCircle style={{fontSize: '22px', color: '#28a745'}} onClick={() => addMetaTag()}/>
                                : null
                            }
                        </td>
                        </tr>
                    </tbody>
                </Table>
                : null
                }

                <h5 style={{marginBottom: '0.5em', fontWeight:'bold'}}>Modify Existing Meta Tags</h5>
                <p>Here existing meta tags can have their active state changed</p>
                {
                    maps ? 
                    <Table striped bordered hover>
                        <thead>
                            <tr style={{textAlign: 'center'}}>
                            <th>Name</th>
                            <th>Colour</th>
                            <th>Active State</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign: 'center'}}>
                            {   Object.keys(maps.contents).length > 0?
                                Object.keys(maps.contents).filter(key => !DEFAULT_MAPS.includes(key)).map(key => (<tr>
                                <td>{key}</td>
                                <td>
                                <Button disabled style={{borderColor: maps.contents[key].colour, backgroundColor: maps.contents[key].colour, padding: '0.2em'}}>
                                    <MdBrush style={{color: 'white'}}/>
                                </Button>
                                </td>
                                <td style={{fontWeight: 'bolder'}}>
                                    <ButtonGroup toggle>
                                        <ToggleButton
                                            key='toggle-active'
                                            type='radio'
                                            name='toggle-active'
                                            checked={maps.contents[key].active}
                                            onChange={() => activateMap(key, true)}
                                        >
                                            Active
                                        </ToggleButton>
                                        <ToggleButton
                                            key='toggle-active'
                                            type='radio'
                                            name='toggle-active'
                                            checked={!maps.contents[key].active}
                                            onChange={() => activateMap(key, false)}
                                        >
                                            Inactive
                                        </ToggleButton>
                                    </ButtonGroup>
                                </td>
                            </tr>))
                            : null
                            }
                        </tbody>
                    </Table>
                : null
                }
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModifySchema(false)}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    )
}
