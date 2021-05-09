import React from 'react'
import { ListGroup } from 'react-bootstrap';
import { MdDelete, MdEdit } from 'react-icons/md'

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
        <div style={{width: '50%', margin: 'auto', marginTop: '2em'}}>
            <ListGroup>
            {
                projects.map((project, index) => {
                    return(
                        <>
                        <ListGroup.Item action key={index}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{fontSize: '22px', fontWeight: 'bold'}} >
                                    {project.name}
                                </div>
                                <div >
                                    <MdEdit style={{fontSize: '22px'}} onClick={() => confirmationAction(index)}/>
                                    <MdDelete style={{fontSize: '22px', color: '#D95F69'}} onClick={() => deleteAction(index)}/>
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
