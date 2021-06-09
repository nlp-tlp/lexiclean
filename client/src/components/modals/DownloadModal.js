import React from 'react'
import { Modal, Button, Table } from 'react-bootstrap';
import { MdFileDownload, MdLibraryBooks } from 'react-icons/md';

import axios from 'axios';

const maps = [
    {
        'name': 'domain_specific',
    },
    {
        'name': 'sensitive'
    },
    {
        'name': 'noise'
    }
]

export default function DownloadModal({showDownload, setShowDownload, project}) {
    
    const downloadResults = async (project) => {
    
        // Fetch results
        const resultRes = await axios.get(`/api/project/results-download/${project._id}`);

        if (resultRes.status === 200){
            console.log('Results fetched successfully')

            // Prepare for file download
            const fileName = `${project.name}_results`;
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

    const downloadMaps = async (project, mapName) => {
        console.log(`Downloading ${mapName} mapping`);

        const response = await axios.post(`/api/map/download/${project._id}`, {mapName: mapName});

        if (response.status === 200){
            console.log('map was succesfully formatted');
            console.log(response.data);

            // Prepare for file download
            const fileName = `${project.name}_map_${mapName}`;
            const json = JSON.stringify(response.data, null, 4);
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
                <p>Normalisation and mappings for project <strong>{project.name}</strong></p>
                <Table bordered hover>
                    <tbody>
                        <tr style={{backgroundColor: 'rgba(0,0,0,0.05)'}}>
                        <td>Normalisations</td>
                        <td>Extended W-NUT JSON format</td>
                        <td>
                            <MdFileDownload style={{fontSize: '22px', margin: 'auto', color: 'black'}} onClick={() => downloadResults(project)}/> 
                        </td>
                        </tr>
                        {
                            maps.map((map, index) => (
                            <tr key={index}>
                                <td>{map.name}</td>
                                <td>Mapping in JSON format</td>
                                <td>
                                    <MdFileDownload style={{fontSize: '22px', margin: 'auto', color: 'black'}} onClick={() => downloadMaps(project, map.name)}/> 
                                </td>
                            </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDownload(false)}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    )
}
