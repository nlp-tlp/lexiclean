import React, { useState, useEffect } from 'react'
import { Modal, Button, Table, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { MdFileDownload, MdLibraryBooks } from 'react-icons/md';
import { IoInformationCircleSharp } from 'react-icons/io5';
import { createUseStyles } from 'react-jss';
import axios from 'axios';

const useStyles = createUseStyles({
    previewLink: {
        fontSize: '0.75em',
        fontWeight: 'bold',
        color: '#0645AD',
        cursor: 'pointer',
        '&:hover': {
            opacity: '0.8'
        }
    }
})



const DEFAULT_MAPS = ['ua', 'st', 'en'];

export default function DownloadModal({showDownload, setShowDownload, project}) {
    const classes = useStyles();

    const [maps, setMaps] = useState();
    const [mapsLoaded, setMapsLoaded] = useState(false);
    const [resultType, setResultType] = useState('seq2seq');

    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('')

    useEffect(() => {
        const fetchProjectMaps = async () => {
          if (!mapsLoaded){
            const response = await axios.get(`/api/map/${project._id}`)
            if (response.status === 200){
            //   console.log(response.data);
              setMaps(response.data.map_keys.filter(key => !DEFAULT_MAPS.includes(key)));
              setMapsLoaded(true);
            }
          }
        }
        fetchProjectMaps();
      }, [mapsLoaded])

   
    const downloadResults = async (project) => {
        // Fetch results
        const resultRes = await axios.post('/api/project/download/result',
                                            { project_id: project._id, type: resultType },
                                            {headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token'))}}
                                            );
        if (resultRes.status === 200){
            // Prepare for file download
            const fileName = `${project.name}_${resultType}_results`;
            const json = JSON.stringify(resultRes.data, null, 4);
            const blob = new Blob([json], {type: 'application/json'});
            const href = await URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = fileName + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const previewResults = async (project) => {
        const resultRes = await axios.post('/api/project/download/result',
                                            { project_id: project._id, type: resultType, preview: true },
                                            {headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token'))}}
                                            );
        if (resultRes.status === 200){
            setShowPreview(true);
            setPreviewContent(JSON.stringify(resultRes.data, null, 4));
        }
    }

    const previewMap = async (project, mapName) => {

        const response = await axios.post('/api/map/download', {project_id: project._id, mapName: mapName, preview: true});
        if (response.status === 200){
            setShowPreview(true);

            if (mapName === 'rp'){
                // Format JSON
                setPreviewContent(JSON.stringify(response.data, null, 2));
            } else {
                // Format TXT
                console.log(response.data);
                setPreviewContent(response.data.values.join("\n"));
            }
        }
    }

    const downloadMaps = async (project, mapName) => {
        // console.log(`Downloading ${mapName} mapping`);

        const response = await axios.post('/api/map/download', {project_id: project._id, mapName: mapName});

        if (response.status === 200){
            if (mapName === 'rp'){
                // Only replacements are output as JSON
                
                // Prepare for file download
                const fileName = `${project.name}_map_replacements`;
                const json = JSON.stringify(response.data, null, 2);
                const blob = new Blob([json], {type: 'application/json'});
                const href = await URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.download = fileName + '.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } else {
                // Others are output as TXT
                const fileName = `${project.name}_map_${mapName}`;
                const text = response.data.values.join('\n');
                const blob = new Blob([text], {type: 'text/plain'});
                const href = await URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.download = fileName + '.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
    
    const resultTypeCheckBox = (
        <div style={{display: 'flex', justifyContent:'space-around'}}>
            <Form.Check inline type="checkbox" label="Seq2Seq" style={{fontSize: '14px'}} checked={resultType === 'seq2seq'} onChange={() => setResultType('seq2seq')}/>
            <Form.Check inline type="checkbox" label="Token Clf" style={{fontSize: '14px'}} checked={resultType === 'tokenclf'} onChange={() => setResultType('tokenclf')}/>
        </div>
        )
    return (
        <Modal
            show={showDownload}
            onHide={() => setShowDownload(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title><MdLibraryBooks style={{marginRight: '0.5em'}}/>Download Results</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Normalisation and gazetteers for project <strong>{project.name}</strong></p>
                <Table bordered hover>
                    <tbody>
                        <tr style={{backgroundColor: 'rgba(0,0,0,0.05)'}}>
                        <td>Normalisations
                            <p
                                className={classes.previewLink}
                                onClick={() => previewResults(project)}
                            >
                                preview
                            </p>
                        </td>
                        <td>Extended W-NUT JSON format { resultTypeCheckBox }</td>
                        <td>
                            <MdFileDownload
                                style={{fontSize: '22px', margin: 'auto', color: 'black'}}
                                onClick={() => downloadResults(project)}
                            />
                        </td>
                        </tr>
                        {
                            maps ?
                                maps.map((mapName, index) => (
                                <tr key={index}>
                                    <td>
                                        {mapName === 'rp' ? 'replacements' : mapName}
                                        <p
                                            className={classes.previewLink}
                                            onClick={() => previewMap(project, mapName)}
                                        >
                                            preview
                                        </p>
                                    </td>
                                    <td>{mapName === 'rp' ? 'Mapping in JSON format' : 'Mapping in TXT format'}</td>
                                    <td>
                                        <MdFileDownload
                                            style={{fontSize: '22px', margin: 'auto', color: 'black'}} onClick={() => downloadMaps(project, mapName)}
                                        /> 
                                    </td>
                                </tr>
                                ))
                            : null
                        }
                    </tbody>
                </Table>

                <p style={{fontSize: '1em', fontWeight: 'bold'}}>Preview</p>
                <div style={{backgroundColor: 'rgba(0,0,0,0.025)', padding: '0.5em', overflowY: 'scroll', maxHeight: '30vh'}}>
                    <pre>
                        { previewContent }
                    </pre>
                </div>

            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDownload(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}
