import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Spinner, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';

import Text from './Text';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '80%',
    margin: 'auto',
    // overflowY: 'scroll',
    // maxHeight: '700px'
  },
  row: {
    display: 'flex',
    padding: '1em',
    backgroundColor: '#F2F2F2',
    marginTop: '1em'
  },
  textColumn: {
    marginLeft: '1em',
    minHeight: '2em'
  },
  indexColumn: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginLeft: '2em',
    paddingRight: '2em',
    marginRight: '1em',
    width: '1em'
  }
});


const PAGE_LIMIT = 2;


export default function AnnotationTable({project, tokens_en, tokens_ds, lexNormDict, setLexNormDict, saved, setSaved}) {
  const classes = useStyles();

  const [texts, setTexts] = useState();
  const [dsTokens, setDsTokens] = useState();
  const [maps, setMaps] = useState();
  const [replacementMap, setReplacementMap] = useState();

  const [loaded, setLoaded] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [replacementsLoaded, setReplacementsLoaded] = useState(false);

    
  const [paginatorLoaded, setPaginatorLoaded] = useState();
  const [totalPages, setTotalPages] = useState();
  const [page, setPage] = useState(1);


  useEffect(() => {
    // Fetch pagination metadata
    const fetchPaginationInfo = async () => {
      if (!paginatorLoaded){
        // note large page is used as it will index to a page without any active data...
          const response = await axios.get(`/api/text/${project._id}/filter/`, { params: {page: 1000000, limit: PAGE_LIMIT }})
          if (response.status === 200){
            console.log('pagination meta data response', response.data)
            setTotalPages(response.data.totalPages);
            setPaginatorLoaded(true);
          }
        }
      }  
    fetchPaginationInfo();
  }, [paginatorLoaded])


  useEffect(() => {
    // TODO: Update based on context menu having state change e.g. adding to domain specific terms, abbreviations ect.
    const fetchProjectMaps = async () => {
      if (!mapsLoaded){
        // Fetch maps
        console.log('fetching maps...');
        const maps = await axios.get(`/api/project/maps/${project._id}`)
        if (maps.status === 200){
          console.log('maps', maps.data);
          setMaps(maps.data);
          setMapsLoaded(true);
        }
      }
    }
    fetchProjectMaps();
  }, [mapsLoaded])


  // useEffect(() => {
  //   // Fetches replacements that are made by the user on save and pagination events 
  //   const fetchReplacements = async () => {
  //     const response = await axios.get(`/api/results/${project._id}`)

  //     if (response.status === 200){
  //       setReplacementMap(response.data, () => {
  //         console.log('replacements', response.data);
  //         setReplacementsLoaded(true);
  //       });
  //     }

  //   }

  //   fetchReplacements();
  // }, [page, saved])



  useEffect(() => {
    const fetchData = async () => {
        setLoaded(false);
        const response = await axios.get(`/api/text/${project._id}/filter/`,{ params: { page: page, limit: PAGE_LIMIT }})
        if (response.status === 200){
          console.log('texts response', response.data.docs)
          setTexts(response.data.docs);
          setLoaded(true);
        }
      }

    fetchData();
  }, [page])


  useEffect(() => {
    const saveResults = async () => {
      // If there are results, save them when paginating, otherwise skip.
      if (Object.keys(lexNormDict).length > 0){
          const resultsPayload = Object.keys(lexNormDict).map(tokenId => {return{"project_id": project._id,
                                                                                  "doc_id": lexNormDict[tokenId].doc_id,
                                                                                  "token_id": tokenId,
                                                                                  "replacement_token": lexNormDict[tokenId].replacement_token
                                                                                }})
          const response = await axios.patch('/api/results/add-many', {results: resultsPayload})
          if (response.status === 200){
            console.log('Successfully saved data')
            setLexNormDict({});
            setSaved(false);
          }
      }
    }
    saveResults();
  }, [page, saved])


  return (
    <>
      {/* // Need to add icon to indicate that the document has no detected non-canonical tokens */}
      <div className={classes.container}>
        {
          (!loaded && !replacementsLoaded) ? 
            <div style={{margin: 'auto'}}>
              <Spinner animation="border" />
            </div>
          :
          texts.map((text, textIndex) => {
            return(
              <div className={classes.row} key={textIndex}>
                <div className={classes.indexColumn}>{textIndex+1 + ((page-1)*10)}</div>
                <div className={classes.textColumn}>
                  <Text
                    text={text}
                    textIndex={text._id}
                    maps={maps}
                    setMaps={setMaps}
                    lexNormDict={lexNormDict}
                    setLexNormDict={setLexNormDict}
                    page={page}
                    />
                </div>
              </div>
            )
          })
        }
      </div>
      
      {
        loaded ? 
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
          <Pagination>
            { 
              [...Array(totalPages).keys()].map(number => {
                return(
                <Pagination.Item key={ number+1 } active={ number+1 === page } onClick={() => setPage(number+1)}>
                { number+1 }
                </Pagination.Item>
              )
            })
          }
          </Pagination>
        </div>
        : null
      }
    </>
  );
}
