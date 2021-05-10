import React from 'react'
import { Pagination } from 'react-bootstrap';

export default function Paginator({page, setPage, totalPages,}) {
    return (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
          <Pagination>
            {
              page > 3 ?
              <>
              <Pagination.First onClick={() => setPage(1)}/>
              <Pagination.Prev onClick={() => setPage(page-1)}/>
              <Pagination.Ellipsis/>
              </>
              : null
            }
            {
              (page < 3) ? [0, 1, 2, 3, 4].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => setPage(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
              : (page < totalPages-4) ?
              [page-3, page-2, page-1, page, page+1].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => setPage(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
              :
              [totalPages-5, totalPages-4, totalPages-3, totalPages-2, totalPages-1].map(number => {
                return(
                  <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => setPage(number+1)}>
                  { number+1 }
                  </Pagination.Item>
                )
              })
            }
            {
              page < totalPages-4 ?
              <>
              <Pagination.Ellipsis/>
              <Pagination.Next onClick={() => setPage(page+1)}/>
              <Pagination.Last onClick={() => setPage(totalPages)}/>
              </>
              : null
            }
          </Pagination>
        </div>
    )
}
