import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';

import Text from './Text';
import Paginator from './utils/Paginator';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '80%',
    margin: 'auto'
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

export default function AnnotationTable({project, replacementDict, setReplacementDict, pageLimit, saved, setSaved, setPageChanged}) {
  const classes = useStyles();

  const [texts, setTexts] = useState();
  const [maps, setMaps] = useState();
  const [metaTagSuggestionMap, setMetaTagSuggestionMap] = useState({"abbreviation": {}, "domain_specific": {}, "english_word": {}, "noise": {}, "unsure": {}});

  console.log(metaTagSuggestionMap)

  const [loaded, setLoaded] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [replacementsLoaded, setReplacementsLoaded] = useState(false);

  const [paginatorLoaded, setPaginatorLoaded] = useState();
  const [totalPages, setTotalPages] = useState();
  const [page, setPage] = useState(1);


  useEffect(() => {
    // Updates page status anytime pagination occurs. This updates upstream components.
    setPageChanged(page);
  }, [page])

  useEffect(() => {
    // Fetch pagination metadata
    const fetchPaginationInfo = async () => {
      if (!paginatorLoaded || pageLimit){
        // note large page is used as it will index to a page without any active data...
          const response = await axios.get(`/api/text/filter/pages/${project._id}`, { params: {limit: pageLimit }})
          if (response.status === 200){
            console.log('pagination meta data response', response.data)
            setTotalPages(response.data.totalPages);
            setPaginatorLoaded(true);
          }
        }
      }  
    fetchPaginationInfo();
  }, [paginatorLoaded, pageLimit])


  useEffect(() => {
    // TODO: Update based on context menu having state change e.g. adding to domain specific terms, abbreviations ect.
    const fetchProjectMaps = async () => {
      if (!mapsLoaded){
        // Fetch maps
        console.log('fetching maps...');
        const maps = await axios.get(`/api/project/maps/${project._id}`)
        if (maps.status === 200){
          console.log('maps loaded')
          // console.log('maps', maps.data);
          setMaps(maps.data);
          setMapsLoaded(true);
        }
      }
    }
    fetchProjectMaps();
  }, [mapsLoaded])


  useEffect(() => {
    // On save or page change, any suggested replacements that remain are posted to the backend

    const fetchReplacements = async () => {


      // const response = await axios.get(`/api/results/${project._id}`)

      // if (response.status === 200){
      //   setReplacementMap(response.data, () => {
      //     console.log('replacements', response.data);
      //     setReplacementsLoaded(true);
      //   });
      // }

    }

    fetchReplacements();
  }, [page, saved])



  useEffect(() => {
    const fetchData = async () => {
        setLoaded(false);
        const response = await axios.get(`/api/text/filter/${project._id}`,{ params: { page: page, limit: pageLimit }})
        if (response.status === 200){
          console.log('texts response', response.data)
          setTexts(response.data);
          setLoaded(true);
        }
      }

    fetchData();
  }, [page, pageLimit])


  useEffect(() => {
    // Cascades replacements as suggested replacements across tokens
    const updateTokens = async () => {
      console.log('suggesting replacements with', replacementDict);
      if (Object.keys(replacementDict).length > 0){

        const response = await axios.patch(`/api/token/suggest-many/${project._id}`, {replacement_dict: replacementDict});

        if (response.status === 200){
          console.log('Updated tokens with suggested replacements')

          setReplacementDict({});

        }
      }
    }
    updateTokens();
  }, [page])


  useEffect(() => {
    // Converts suggested replacements to replacements for results on page 
    //  (users needs to remove them if they don't want they to persist)



    console.log('page changed')
  }, [page])


  // useEffect(() => {
  //   const saveResults = async () => {
  //     // If there are results, save them when paginating, otherwise skip.
  //     if (Object.keys(replacementDict).length > 0){
  //         const resultsPayload = Object.keys(replacementDict).map(tokenId => {return{"project_id": project._id,
  //                                                                                 "doc_id": replacementDict[tokenId].doc_id,
  //                                                                                 "token_id": tokenId,
  //                                                                                 "replacement_token": replacementDict[tokenId].replacement_token
  //                                                                               }})
  //         const response = await axios.patch('/api/results/add-many', {results: resultsPayload})
  //         if (response.status === 200){
  //           console.log('Successfully saved data')
  //           setReplacementDict({});
  //           setSaved(false);
  //         }
  //     }
  //   }
  //   saveResults();
  // }, [page, saved])


  return (
    <>
      {/* // Need to add icon to indicate that the document has no detected non-canonical tokens */}
      <div className={classes.container}>
        {
          (!loaded && !replacementsLoaded) ? 
            <div style={{margin: 'auto', marginTop: '5em'}}>
              <Spinner animation="border" />
            </div>
          :
          texts.map((text, textIndex) => {
            return(
              <div className={classes.row} key={textIndex} style={{background: text.annotated ? '#8F8F8F': null, opacity: text.annotated ? 0.5 : 1.0}}>
                <div className={classes.indexColumn} >{textIndex+1 + ((page-1)*pageLimit)}</div>
                <div className={classes.textColumn}>
                  <Text
                    text={text}
                    textIndex={text._id}
                    maps={maps}
                    setMaps={setMaps}
                    replacementDict={replacementDict}
                    setReplacementDict={setReplacementDict}
                    page={page}
                    metaTagSuggestionMap={metaTagSuggestionMap}
                    setMetaTagSuggestionMap={setMetaTagSuggestionMap}
                    />
                </div>
              </div>
            )
          })
        }
      </div>
      
      {
        loaded ? 
        <Paginator 
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        : null
      }
    </>
  );
}
