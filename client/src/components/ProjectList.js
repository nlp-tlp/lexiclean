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
