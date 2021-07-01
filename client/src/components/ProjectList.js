import React, { useState } from 'react'
import { ListGroup } from 'react-bootstrap';
import { MdDelete, MdEdit, MdFileDownload } from 'react-icons/md';
import { RiNumbersFill } from 'react-icons/ri'
import { createUseStyles } from 'react-jss';

import DownloadModal from './modals/DownloadModal';


const DELETE_COLOUR = '#D95F69';
const useStyles = createUseStyles({
    container: {
        width: '75%',
        margin: 'auto',
        marginTop: '2em',
        maxWidth: '50vw'
    },
    projectListItemContainer: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    projectDetailContainer: {
        width: '25vw'
    },
    projectName: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 'auto'
    },
    projectDescription: {
        fontSize: '16px',
        margin: 'auto',
        verticalAlign: 'middle'
    },
    projectCreationDate: {
        fontSize: '12px',
        margin: 'auto',
        marginTop: '1em'
    },
    metricsContainer: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    singleMetricContainer: {
        margin: '0em 2em 0em 2em'
    },
    metricIcon: {
        width: '36px',
        height: '36px',
        fontSize: '22px',
        textAlign: 'center',
        borderRadius: '50%',
        margin: 'auto',
        color: 'white',
        paddingRight: '0.1em',
        backgroundColor: 'grey'
    },
    metricTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0em',
        margin: 'auto',
        textAlign: 'center'
    },
    metricTextTitle: {
        fontSize: '14px'
    },
    metricTextNumber: {
        fontWeight: 'bolder',
        fontSize: '18px',
        margin: '0'
    },
    actionContainer: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '22px'
    },
    actionIcon: {
        margin: '0em 0.5em 0.5em 0em'
    }
})


export default function ProjectList({projects, setSelectedProject, setShowAnnotate, setShowProjectDelete}) {
    const classes = useStyles();
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
        <div className={classes.container}>
            <ListGroup>
            {
                projects.map((project, index) => {
                    return(
                        <>
                        <ListGroup.Item action key={index}>
                            <div className={classes.projectListItemContainer} key={index}>
                                <div
                                    className={classes.projectDetailContainer}
                                    onClick={() => confirmationAction(index)}
                                    key={index}
                                >
                                    <h1 className={classes.projectName}>{ project.name }</h1>
                                    <p className={classes.projectDescription}>{ project.description }</p>
                                    <p className={classes.projectCreationDate}>{ new Date(project.created_on).toDateString() }</p>
                                </div>

                                <div className={classes.metricsContainer}>
                                    <div className={classes.singleMetricContainer}>
                                        <div className={classes.metricIcon}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div className={classes.metricTextContainer}>
                                            <div>
                                                <p className={classes.metricTextNumber}>{project.annotated_texts}/{project.text_count}</p>
                                                <p className={classes.metricTextTitle}>Texts<br/>Annotated</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.singleMetricContainer}>
                                        <div className={classes.metricIcon}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div className={classes.metricTextContainer}>
                                            <div>
                                                <p className={classes.metricTextNumber}>{ Math.round(project.vocab_reduction) }%</p>
                                                <p className={classes.metricTextTitle}>Vocabulary<br/>Reduction</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.singleMetricContainer}>
                                        <div className={classes.metricIcon}>
                                            <RiNumbersFill/>
                                        </div>
                                        <div className={classes.metricTextContainer}>
                                            <div>
                                                <p className={classes.metricTextNumber}>{project.oov_corrections}/{project.metrics.starting_oov_token_count}</p>
                                                <p className={classes.metricTextTitle}>OOV<br/>Corrections</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={classes.actionContainer}>
                                    <MdEdit className={classes.actionIcon} onClick={() => confirmationAction(index)}/>
                                    <MdFileDownload className={classes.actionIcon} onClick={() => downloadHandler(project)}/> 
                                    <MdDelete className={classes.actionIcon} style={{color: DELETE_COLOUR}} onClick={() => deleteAction(index)}/>
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
