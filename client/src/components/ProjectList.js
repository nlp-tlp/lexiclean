import React from 'react'
import { ListGroup } from 'react-bootstrap';
import { MdDelete, MdEdit, MdFileDownload } from 'react-icons/md'

export default function ProjectList({projects, setSelectedProject, setShowAnnotate, setShowProjectDelete}) {

    const confirmationAction = (index) => {
        setSelectedProject(projects[index]);
        setShowAnnotate(true);
    }

    const deleteAction = (index) => {
        setSelectedProject(projects[index]);
        setShowProjectDelete(true);
    }
    
    return (
        <div style={{width: '75%', margin: 'auto', marginTop: '2em'}}>
            <ListGroup>
            {
                projects.map((project, index) => {
                    return(
                        <>
                        <ListGroup.Item action key={index}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{fontSize: '22px', fontWeight: 'bold'}} onClick={() => confirmationAction(index)}>
                                    {project.name}
                                    <br/>
                                    <small>{project.description}</small>
                                </div>
                                <div style={{fontSize: '22px'}}>
                                    <MdEdit onClick={() => confirmationAction(index)}/>
                                    <MdFileDownload onClick={() => console.log('prep results for download...')}/>
                                    <MdDelete style={{color: '#D95F69'}} onClick={() => deleteAction(index)}/>
                                </div>
                            </div>
                        </ListGroup.Item>
                        </>
                    )
                })
            }
            </ListGroup>
        </div>
    )
}
