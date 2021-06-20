import React, { useState } from 'react'
import { ListGroup } from 'react-bootstrap';
import { MdDelete, MdEdit, MdFileDownload } from 'react-icons/md';
import { RiNumbersFill } from 'react-icons/ri'

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
                                    onClick={() => confirmationAction(index)}
                                    key={index}
                                >
                                    <h1 style={{fontSize: '32px', fontWeight: 'bold', margin: 'auto'}} >
                                        {project.name}
                                    </h1>
                                    <p style={{fontSize: '20px', margin: 'auto', verticalAlign: 'middle'}} >
                                        {project.description}
                                    </p>
                                    <br/>
                                    <p style={{fontSize: '12px', margin: 'auto'}}>{project.created_on}</p>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div style={{margin: '0em 2em 0em 2em'}}>
                                        <div style={{width: '36px', height: '36px', fontSize: '22px', textAlign: 'center', borderRadius: '50%', margin: 'auto', color: 'white', paddingRight: '0.1em', backgroundColor: 'grey'}}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingLeft: '0.5em', padding: '0em', margin: 'auto', textAlign: 'center'}}>
                                            <div>
                                                <p style={{fontWeight: 'bolder', fontSize: '18px', margin: '0'}}>{project.annotated_texts}/{project.text_count}</p>
                                                <p style={{fontSize: '14px'}}>Complete</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{margin: '0em 2em 0em 2em', color: 'lightgrey'}}>
                                        <div style={{width: '36px', height: '36px', fontSize: '22px', textAlign: 'center', borderRadius: '50%', margin: 'auto', color: 'white', paddingRight: '0.1em', backgroundColor: 'lightgrey'}}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingLeft: '0.5em', padding: '0em', margin: 'auto', textAlign: 'center'}}>
                                            <div>
                                                <p style={{fontWeight: 'bolder', fontSize: '18px', margin: '0'}}>{project.annotated_texts}/{project.text_count}</p>
                                                <p style={{fontSize: '14px'}}>Complete</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{margin: '0em 2em 0em 2em', color: 'lightgrey'}}>
                                        <div style={{width: '36px', height: '36px', fontSize: '22px', textAlign: 'center', borderRadius: '50%', margin: 'auto', color: 'white', paddingRight: '0.1em', backgroundColor: 'lightgrey'}}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingLeft: '0.5em', padding: '0em', margin: 'auto', textAlign: 'center'}}>
                                            <div>
                                                <p style={{fontWeight: 'bolder', fontSize: '18px', margin: '0'}}>{project.annotated_texts}/{project.text_count}</p>
                                                <p style={{fontSize: '14px'}}>Complete</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', fontSize: '22px'}}>
                                    <MdEdit style={{margin: '0em 0.5em 0.5em 0em'}} onClick={() => confirmationAction(index)}/>
                                    <MdFileDownload style={{margin: '0em 0.5em 0.5em 0em'}} onClick={() => downloadHandler(project)}/> 
                                    <MdDelete style={{color: '#D95F69', margin: '0em 0.5em 0.5em 0em'}} onClick={() => deleteAction(index)}/>
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
