import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom'
import { createUseStyles } from 'react-jss';
import { Dropdown, Button } from 'react-bootstrap';
import { MdPlaylistAddCheck } from 'react-icons/md'

const useStyles = createUseStyles({
    header: {
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
        backgroundColor: '#8F8F8F',
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '2px #D9D9D9 solid',
        position: 'sticky',
        top: '0',
    },
    title: {
        fontWeight: 'bolder',
        fontSize: '1.5em',
        textAlign: 'left',
        fontFamily: 'sans-serif',
        color: '#F8F9FA',
        padding: '0.25em',
        borderRadius: '0.5em',
        marginLeft: '1em',
    },
    metricsContainer: {
        display: 'inline-block',
        backgroundColor: '#A2D2D2',
        margin: 'auto',
        padding: '0.2em 0.5em 0em 0.5em',
        borderRadius: '0.5em'
    },
    menu: {
        marginRight: '1em',
        padding: '0.25em',
        display: 'flex',
    },
    save: {
        marginLeft: '0.25em',
        fontSize: '36px',
        color: 'green',
        cursor: 'pointer',
    },
})

export default function Header({project, replacementDict, setShowDownload, setShowProgress, setShowSettings, setShowOverview, setShowLegend, setSaved, pageChanged}) {
    const history = useHistory();
    const classes = useStyles();

    const [progress, setProgress] = useState();

    // const changeCount = Object.keys(replacementDict).map(textIndex => Object.keys(replacementDict[textIndex]).length).reduce((a, b) => a + b, 0);
    // const showSaveBtn = Object.keys(replacementDict).length > 0;

    useEffect(() => {
        const fetchProgressInfo = async () => {
            console.log('fetching progress data')
            if (project) {
                const response = await axios.get(`/api/text/progress/${project._id}`)
                if (response.status === 200){
                    setProgress(response.data);
                    console.log(response.data)
                }
            }   
        }
        fetchProgressInfo();
    }, [project, pageChanged])

    return (
        <div className={classes.header}>
                <div className={classes.title}>
                    Lexiclean
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{fontSize: '2em', color: '#F8F9FA', fontWeight: 'bolder', display: 'flex'}}>
                        <p>{ project.name }</p>
                        {/* {
                            showSaveBtn ?
                            <p className={classes.save} onClick={() => setSaved(true)} title={`${changeCount} changes waiting`}>
                                <MdPlaylistAddCheck/>
                            </p>
                            : null
                        } */}
                    </div>
                    {
                        progress ?
                        <div style={{fontSize: '1em', color: '#F8F9FA'}}>
                            {progress.annotated} / {progress.total}
                        </div>
                        : null
                    }
                </div>
                <div className={classes.menu}>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setShowOverview(true)}>Overview</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowLegend(true)}>Legend</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowDownload(true)}>Download Results</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowProgress(true)}>Review Progress</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowSettings(true)}>Settings</Dropdown.Item>
                            <Dropdown.Item onClick={() => history.push('/')}>Home</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>


        </div>
    )
}
