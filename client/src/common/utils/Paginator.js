import React, { useState } from 'react'
import { Pagination, OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom'
import { createUseStyles } from 'react-jss';


const useStyles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1em',
    marginBottom: '4em'
  },
  actionButton: {
     display:'inline-block',
     padding:'0.1em 1em',
     margin:'0.1em',
     border:'0.1em solid lightgrey',
     boxSizing: 'border-box',
     textDecoration:'none',
     textAlign:'center',
     color:'white',
     backgroundColor:'grey',
    marginRight: '0.5em',
    '&:hover': {
        opacity: '0.8',
        color:'white',
        backgroundColor:'grey',
        border:'0.1em solid lightgrey',
    },
    '&:disabled': {
        opacity: '0.2',
        color:'grey',
        backgroundColor:'lightgrey',
        border:'0.1em solid grey',
    }
},
});


export default function Paginator({page, setPage, totalPages, project}) {
    const classes = useStyles()  
    const history = useHistory();
    const [pageSelected, setPageSelected] = useState('')

    const routeChange = (page) => {
      setPage(page);
      history.push(`/project/${project._id}/page/${page}`)
    }

    const ellipsisGo = (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        overlay={
          <Popover style={{maxWidth: '100%', margin: 'auto'}}>
            <Popover.Title><strong>Page</strong></Popover.Title>
            <Popover.Content>
              <div style={{display: 'flex', margin: 'auto'}}>
                <input style={{maxWidth: '100%'}}
                  type="number"
                  min="1"
                  max={totalPages}
                  step="1"
                  value={pageSelected}
                  onChange={e => setPageSelected(e.target.value)}
                />
                <Button
                  className={classes.actionButton}
                  size="sm"
                  onClick={() => routeChange(pageSelected)}
                >
                  Go
                </Button>
              </div>
            </Popover.Content>
          </Popover>
        }
      >
        <Pagination.Ellipsis/>
      </OverlayTrigger>
    );

    return (
        <div className={classes.container}>
          <Pagination>
            {
              page > 4 ?
              <>
              <Pagination.First onClick={() => routeChange(1)}/>
              <Pagination.Prev onClick={() => routeChange(page-1)}/> 
              { ellipsisGo }
              </>
              : null
            }
            {
              (page <= 4) ? [...Array(totalPages < 5 ? totalPages : 5).keys()].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => routeChange(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
              : (page < totalPages-4) ?
              [page-3, page-2, page-1, page, page+1].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => routeChange(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
              :
              [totalPages-5, totalPages-4, totalPages-3, totalPages-2, totalPages-1].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => routeChange(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
            }
            {
              page < totalPages-4 ?
              <>
              { ellipsisGo }
              <Pagination.Next onClick={() => routeChange(page+1)}/>
              <Pagination.Last onClick={() => routeChange(totalPages)}/>
              </>
              : null
            }
          </Pagination>
        </div>
    )
}
