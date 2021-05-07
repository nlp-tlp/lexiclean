import React from 'react'
import { ListGroup } from 'react-bootstrap';

export default function ProjectList({projects, setSelectedProject, setShowAnnotate}) {

    const confirmationAction = (index) => {
        setSelectedProject(projects[index])
        setShowAnnotate(true);
    }
    
    return (
        <div style={{width: '50%', margin: 'auto', marginTop: '2em'}}>
            <ListGroup>
            {
                projects.map((project, index) => {
                    return(
                        <ListGroup.Item action key={index} onClick={() => confirmationAction(index)}>
                            <div style={{fontSize: '22px', fontWeight: 'bold'}}>
                                {project.name}
                            </div>
                        </ListGroup.Item>
                    )
                })
            }
            </ListGroup>
        </div>
    )
}
