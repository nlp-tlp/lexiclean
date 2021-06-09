import React, { useState } from 'react'
import { ListGroup } from 'react-bootstrap';
import { MdDelete, MdEdit, MdFileDownload, MdLibraryBooks } from 'react-icons/md';
import axios from 'axios';

import DownloadModal from './modals/DownloadModal';

export default function ProjectList({projects, setSelectedProject, setShowAnnotate, setShowProjectDelete}) {

    const [showDownload, setShowDownload] = useState(false);
    const [downloadProject, setDownloadProject] = useState();

    const confirmationAction = (index) => {
        setSelectedProject(projects[index]);
        setShowAnnotate(true);
    }

    const deleteAction = (index) => {
        setSelectedProject(projects[index]);
        setShowProjectDelete(true);
    }

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

    const downloadMaps = async (project) => {
        console.log('Downloading maps');
        
    }

    const downloadHandler = async (project) => {
        console.log('handling download')
        setDownloadProject(project);
        setShowDownload(true);


    }

    
    return (
        <>
        {
            showDownload ?
            <DownloadModal
                showDownload={showDownload}
                setShowDownload={setShowDownload}
                project={downloadProject}
            />
            : null
        }
        <div style={{width: '75%', margin: 'auto', marginTop: '2em'}}>
            <ListGroup>
            {
                projects.map((project, index) => {
                    return(
                        <>
                        <ListGroup.Item action key={index}>
                            <div 
                                style={{display: 'flex', justifyContent: 'space-between'}}
                                key={index}
                            >
                                <div 
                                    style={{fontSize: '22px', fontWeight: 'bold'}}
                                    onClick={() => confirmationAction(index)}
                                    key={index}
                                >
                                    {project.name}
                                    <br/>
                                    <small>{project.description}</small>
                                    <br/>
                                    <small>{project.annotated_texts}/{project.text_count}</small>

                                </div>
                                <div style={{fontSize: '22px'}}>
                                    <MdEdit onClick={() => confirmationAction(index)}/>
                                    <MdFileDownload onClick={() => downloadHandler(project)}/> 
                                    {/* downloadResults(project) */}
                                    {/* <MdLibraryBooks onClick={() => downloadMaps(project)}/> */}
                                    <MdDelete style={{color: '#D95F69'}} onClick={() => deleteAction(index)}/>
                                    <br/>
                                    <p style={{fontSize: '12px'}}>{project.created_on}</p>
                                </div>
                            </div>
                        </ListGroup.Item>
                        </>
                    )
                })
            }
            </ListGroup>
        </div>
        </>
    )
}
