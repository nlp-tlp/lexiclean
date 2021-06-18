import React, { useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import { CgMergeVertical, CgMoreVertical } from 'react-icons/cg';
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
    justifyContent: 'space-between',
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

export default function AnnotationTable({project,
                                          replacementDict,
                                          setReplacementDict,
                                          pageLimit,
                                          saved,
                                          setSaved,
                                          setPageChanged,
                                          setToastInfo
                                        }) {
  const classes = useStyles();

  const [texts, setTexts] = useState();
  const [loaded, setLoaded] = useState(false);
  const [metaTagSuggestionMap, setMetaTagSuggestionMap] = useState();
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const [bgColourMap, setBgColourMap] = useState();
  
  const [paginatorLoaded, setPaginatorLoaded] = useState();
  const [totalPages, setTotalPages] = useState();
  const [page, setPage] = useState(1);
  
  // TOKEN SELECT HANDLER
  const [selectedTokens, setSelectedTokens] = useState();
  const [tokenize, setTokenize] = useState();
  
  
  // User interaction
  const [updateSingleToken, setUpdateSingleToken] = useState(null);
  const [changeTrigger, setChangeTrigger] = useState(false); 


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
            // console.log('pagination meta data response', response.data)
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
      if (!mapsLoaded && project){
        const response = await axios.get(`/api/map/${project._id}`)
        if (response.status === 200){
          setMetaTagSuggestionMap(Object.fromEntries(response.data.map_keys.map(key => ([[key], {}]))))
          setBgColourMap(response.data.colour_map);
          setMapsLoaded(true);
        }
      }
    }
    fetchProjectMaps();
  }, [mapsLoaded])


  useEffect(() => {
    const fetchData = async () => {
        setLoaded(false);
        const response = await axios.get(`/api/text/filter/${project._id}`, { params: { page: page, limit: pageLimit }})
        if (response.status === 200){
          setTexts(response.data);
          setLoaded(true);
        }
      }

    fetchData();
  }, [page, pageLimit]) // , tokenize// TODO review when implemented correctly.


  // useEffect(() => {
  //   // Cascades replacements as suggested replacements across tokens
  //   const updateTokens = async () => {
  //     if (Object.keys(replacementDict).length > 0){
  //       console.log('suggesting replacements with ->', replacementDict);
  //       const response = await axios.patch(`/api/token/suggest/all/${project._id}`, {replacement_dict: replacementDict});
  //       if (response.status === 200){
  //         // console.log('suggested replacement response', response)
  //         // console.log('Updated tokens with suggested replacements')
  //         // setReplacementDict({});
  //       }
  //     }
  //   }
  //   updateTokens();
  // }, [page]) // saved


  // useEffect(() => {
  //   // Cascades meta-tags across tokens
  //   const updateMetaTags = async () => {
  //     if(mapsLoaded){
  //       if (Object.keys(metaTagSuggestionMap).filter(metaTag => metaTagSuggestionMap[metaTag].length > 0).length > 0){
  //         // console.log('updating meta-tags with ->', metaTagSuggestionMap);
          
  //         const response = await axios.patch(`/api/token/add-many-meta-tags/${project._id}`, {meta_tag_dict: metaTagSuggestionMap});
  //         if (response.status === 200){
  //           // console.log('updated meta tag response', response)
  //           // console.log('Updated token meta-tags')
  //           setMetaTagSuggestionMap(META_TAG_MAP_INIT); // TODO: FIX THIS - IT IS LOADING THE WRONG INIT STRUCTURE
  //         }
  //       }
  //     }
  //   }
  //   updateMetaTags();
  // }, [page]) // saved

  // useEffect(() => {
  //   // Converts suggested replacements to replacements for results on page 
  //   //  (users needs to remove them if they don't want they to persist)

  //   const convertSuggestedReplacements = async () => {
  //     if (texts && page !== 1){ // dont update on first page load...
  //       // console.log('texts being sent for update on pagination ->', texts)
  //       const response = await axios.patch(`/api/token/suggest-confirm`, { replacement_dict: replacementDict, textIds: texts.map(text => text._id)});
  //       if (response.status === 200){
  //           // console.log('update suggested tokens to replace tokens');
  //       }

  //     }
  //   }
  //   convertSuggestedReplacements();
  // }, [page])


  useEffect(() => {
    // Checks if text has been annotated
    const updateTextAnnotationStates = async () => {
      if (texts){
        await axios.patch('/api/text/check-annotations/', { textIds: texts.map(text => text._id) });
      }
    }
    updateTextAnnotationStates();
  }, [page])



  // Tokenization logic... TODO: fix name.
  const handleTokenize = (textId) => {
    if (tokenize){
      setTokenize();
    } else {
      setTokenize(textId);
    }
  }


  return (
    <>
      <div
        className={classes.container}
        >
        {
          (!loaded || !mapsLoaded) ?
            <div
              style={{margin: 'auto', marginTop: '5em'}}
            >
              <Spinner animation="border" />
            </div>
          :
          texts.map((text, textIndex) => {

            const textProps = {
                    text,
                    replacementDict,
                    setReplacementDict,
                    page,
                    metaTagSuggestionMap,
                    setMetaTagSuggestionMap,
                    updateSingleToken,
                    setUpdateSingleToken,
                    selectedTokens,
                    setSelectedTokens,
                    bgColourMap,
                    tokenize,
                    changeTrigger,
                    setChangeTrigger,
                    setToastInfo
               }
    
            return(
              <div
                className={classes.row}
                key={textIndex}
                style={{background: text.annotated ? 'rgba(153,191,156,0.2)': null}}
              >
                <div
                  style={{display: 'flex'}}
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
                      {...textProps}
                    />
                  </div>
                </div>
                <div
                  style={{fontSize: '26px', fontWeight: 'bold', color: 'grey'}}
                  onClick={() => handleTokenize(text._id)}
                >
                  { 
                    tokenize !== text._id ?
                      <CgMergeVertical/>
                      :
                      <CgMoreVertical/>
                  }
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
