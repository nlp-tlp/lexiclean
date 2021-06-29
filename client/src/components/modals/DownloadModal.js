import React, { useState, useEffect } from 'react'
import { Modal, Button, Table } from 'react-bootstrap';
import { MdFileDownload, MdLibraryBooks } from 'react-icons/md';
import axios from 'axios';

const DEFAULT_MAPS = ['ua', 'st', 'en'];

export default function DownloadModal({showDownload, setShowDownload, project}) {

    const [maps, setMaps] = useState();
    const [mapsLoaded, setMapsLoaded] = useState(false);

    useEffect(() => {
        const fetchProjectMaps = async () => {
          if (!mapsLoaded){
            const response = await axios.get(`/api/map/${project._id}`)
            if (response.status === 200){
              console.log(response.data);
              setMaps(response.data.map_keys.filter(key => !DEFAULT_MAPS.includes(key)));
              setMapsLoaded(true);
            }
          }
        }
        fetchProjectMaps();
      }, [mapsLoaded])

    
    const downloadResults = async (project) => {
    
        // Fetch results
        const resultRes = await axios.get(`/api/project/download/result/${project._id}`);

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
                            maps ?
                                maps.map((mapName, index) => (
                                <tr key={index}>
                                    <td>{mapName === 'rp' ? 'replacements' : mapName}</td>
                                    <td>{mapName === 'rp' ? 'Mapping in JSON format' : 'Mapping in TXT format'}</td>
                                    <td>
                                        <MdFileDownload style={{fontSize: '22px', margin: 'auto', color: 'black'}} onClick={() => downloadMaps(project, mapName)}/> 
                                    </td>
                                </tr>
                                ))
                            : null
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
