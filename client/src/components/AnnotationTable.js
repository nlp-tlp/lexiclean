import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';

import Text from './Text';
import Paginator from './utils/Paginator';


const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '80%',
    margin: 'auto',
    userSelect: 'none', // Stops text from being selected on click
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
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    verticalAlign: 'middle'
    // marginLeft: '2em',
    // paddingRight: '2em',
    // marginRight: '1em',
  },
  indexIcon: {
    fontSize: '22px',
    fontWeight: 'bold',
    width: '2em',
    height: '2em',
    margin: 'auto'
  }
});


const META_TAG_MAP_INIT = {
  "domain_specific": {},
  "abbreviation": {},
  "noise": {},
  "english_word": {},
  "unsure": {},
  "removed": {},
  "sensitive": {}
};

export default function AnnotationTable({project, replacementDict, setReplacementDict, pageLimit, saved, setSaved, setPageChanged}) {
  const classes = useStyles();

  const [texts, setTexts] = useState();
  const [loaded, setLoaded] = useState(false);
  const [metaTagSuggestionMap, setMetaTagSuggestionMap] = useState(META_TAG_MAP_INIT);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const [updateSingleToken, setUpdateSingleToken] = useState(null);


  const [paginatorLoaded, setPaginatorLoaded] = useState();
  const [totalPages, setTotalPages] = useState();
  const [page, setPage] = useState(1);

  // TOKEN SELECT HANDLER
  const [selectedTokens, setSelectedTokens] = useState();


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
          // setMaps(maps.data);
          setMapsLoaded(true);
        }
      }
    }
    fetchProjectMaps();
  }, [mapsLoaded])



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
      if (Object.keys(replacementDict).length > 0){
        console.log('suggesting replacements with ->', replacementDict);
        const response = await axios.patch(`/api/token/suggest-many/${project._id}`, {replacement_dict: replacementDict});
        if (response.status === 200){
          console.log('suggested replacement response', response)
          console.log('Updated tokens with suggested replacements')
          // setReplacementDict({});
        }
      }
    }
    updateTokens();
  }, [page]) // saved


  useEffect(() => {
    // Cascades meta-tags across tokens
    const updateMetaTags = async () => {
      if (Object.keys(metaTagSuggestionMap).filter(metaTag => metaTagSuggestionMap[metaTag].length > 0).length > 0){
        console.log('updating meta-tags with ->', metaTagSuggestionMap);

        const response = await axios.patch(`/api/token/add-many-meta-tags/${project._id}`, {meta_tag_dict: metaTagSuggestionMap});
        if (response.status === 200){
          console.log('updated meta tag response', response)
          console.log('Updated token meta-tags')
          setMetaTagSuggestionMap(META_TAG_MAP_INIT);
        }
      }
    }
    updateMetaTags();
  }, [page]) // saved



  useEffect(() => {
    // Checks if text has been annotated. This helps the sorting algorithm.

    const updateTextAnnotationStates = async () => {
      if (texts){
        const response = await axios.patch('/api/text/check-annotations/', {textIds: texts.map(text => text._id)});
        if (response.status === 200){
          console.log('updated text annotation states');
          console.log(response);
        }
      }
    }
    updateTextAnnotationStates();

  }, [page])


  useEffect(() => {
    // Converts suggested replacements to replacements for results on page 
    //  (users needs to remove them if they don't want they to persist)

    const convertSuggestedReplacements = async () => {
      if (texts && page !== 1){ // dont update on first page load...
        console.log('texts being sent for update on pagination ->', texts)
        const response = await axios.patch(`/api/token/suggest-confirm`, { replacement_dict: replacementDict, textIds: texts.map(text => text._id)});
        if (response.status === 200){
            console.log('update suggested tokens to replace tokens');
        }

      }
    }
    convertSuggestedReplacements();
  }, [page])






  // SEGMENTATION HANDLERS
  // useEffect(() => {
  //   console.log(selectedTokens)

  //   if(selectedTokens && Object.keys(selectedTokens).length > 1){ // has to have at least two tokens
  //     console.log('do you want to segment?')
  //   }

  // }, [selectedTokens])


  // const toggleAction = event => {
  //   console.log(event);
  //   if (event.ctrlKey){
  //     // In select mode - user can click on tokens to concatenate them.
  //     console.log('control down?', event.ctrlKey)
  //     setSelectMode(true);

  //   } else {
  //     // When select mode is off - popover will confirm selected tokens are correct before concatenation. 
  //     console.log('control down?', event.ctrlKey)
  //     setSelectMode(false)
  //   }
  // }

  return (
    <>
      {/* // Need to add icon to indicate that the document has no detected non-canonical tokens */}
      {/* onClick={toggleFunction} onKeyPress={toggleFunction}> */}
        {/* </div>onMouseDown={(e) => toggleAction(e)}> */}
      <div className={classes.container} >
        {
          (!loaded) ? // && !replacementsLoaded 
            <div style={{margin: 'auto', marginTop: '5em'}}>
              <Spinner animation="border" />
            </div>
          :
          texts.map((text, textIndex) => {
            return(
              <div
                className={classes.row}
                key={textIndex}
                style={{background: text.annotated ? 'rgba(153,191,156,0.2)': null}}

              >
                <div
                  className={classes.indexColumn}
                >
                  <p className={classes.indexIcon}>
                    {textIndex+1 + ((page-1)*pageLimit)}
                  </p>
                </div>
                
                <div className={classes.textColumn}>
                  <Text
                    text={text}
                    textIndex={text._id}
                    replacementDict={replacementDict}
                    setReplacementDict={setReplacementDict}
                    page={page}
                    metaTagSuggestionMap={metaTagSuggestionMap}
                    setMetaTagSuggestionMap={setMetaTagSuggestionMap}
                    updateSingleToken={updateSingleToken}
                    setUpdateSingleToken={setUpdateSingleToken}
                    selectedTokens={selectedTokens}
                    setSelectedTokens={setSelectedTokens}
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
