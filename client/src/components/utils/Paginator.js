import React from 'react'
import { Pagination } from 'react-bootstrap';
import { useHistory } from 'react-router-dom'

export default function Paginator({page, setPage, totalPages, project}) {
    const history = useHistory();

    const routeChange = (page) => {
      setPage(page);
      history.push(`/project/${project._id}/page/${page}`)
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
          <Pagination>
            {
              page > 4 ?
              <>
              <Pagination.First onClick={() => routeChange(1)}/>
              <Pagination.Prev onClick={() => routeChange(page-1)}/> 
              <Pagination.Ellipsis/>
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
              <Pagination.Ellipsis/>
              <Pagination.Next onClick={() => routeChange(page+1)}/>
              <Pagination.Last onClick={() => routeChange(totalPages)}/>
              </>
              : null
            }
          </Pagination>
        </div>
    )
}
