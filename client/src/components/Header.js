import React from 'react'
import { useHistory } from 'react-router-dom'
import { createUseStyles } from 'react-jss';
import { Dropdown } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa'

const useStyles = createUseStyles({
    header: {
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
        backgroundColor: '#8F8F8F',
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px #D9D9D9 solid'
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
    legend: {
        fontSize: '16px',
        display: 'flex',
        padding: '0.25em',
        justifyContent: 'space-between',
    },
    legendItem: {
        textAlign: 'center',
        width: '6em',
        margin: '0.5em',
        borderRadius: '0.25em',
        padding: '0.2em'
    },
    menu: {
        marginRight: '1em',
        padding: '0.25em',
    },
    save: {
        fontSize: '32px',
        color: '#F2A477',
        cursor: 'pointer'
    }
})

export default function Header({replacementDict, setShowDownload, setShowProgress, setSaved}) {
    const history = useHistory();
    const classes = useStyles();
    const changeCount = Object.keys(replacementDict).map(textIndex => Object.keys(replacementDict[textIndex]).length).reduce((a, b) => a + b, 0);

    const showSaveBtn = Object.keys(replacementDict).length > 0;

    return (
        <div className={classes.header}>
            <div className={classes.title}>
                Lexiclean
            </div>

            <div className={classes.legend}>

                    <div className={classes.legendItem} style={{backgroundColor: '#F2A477'}}>
                        Candidate
                    </div>
                    <div className={classes.legendItem} style={{backgroundColor: '#99BF9C'}}>
                        Replaced
                    </div>
                    <div className={classes.legendItem} style={{backgroundColor: '#D9D9D9'}}>
                        Normalised
                    </div>
                    <div className={classes.legendItem} style={{backgroundColor: '#6BB0BF'}}>
                        Suggestion
                    </div>

            </div>

            <div className={classes.actions}>
                <div className={classes.menu}>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {/* <Dropdown.Item onClick={() => setShowUpload(true)}>Start New Project</Dropdown.Item> */}
                            <Dropdown.Item onClick={() => setShowDownload(true)}>Download Results</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowProgress(true)}>Review Progress</Dropdown.Item>
                            <Dropdown.Item onClick={() => history.push('/')}>Home</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                {
                    showSaveBtn ?
                    <div className={classes.save} onClick={() => setSaved(true)}>
                        <FaSave/>
                    </div>
                    : null
                }
            </div>
        </div>
    )
}
