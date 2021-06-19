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


export default function AnnotationTable({project,
                                          replacementDict,
                                          setReplacementDict,
                                          pageLimit,
                                          setPageChanged,
                                          setToastInfo,
                                          currentTexts,
                                          setCurrentTexts,
                                          saveTrigger
                                        }) {
  const classes = useStyles();

  const [loaded, setLoaded] = useState(false);
  const [metaTagSuggestionMap, setMetaTagSuggestionMap] = useState();
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const [bgColourMap, setBgColourMap] = useState();
  const [activeMaps, setActiveMaps] = useState();

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
    const fetchProjectMaps = async () => {
      if (!mapsLoaded && project){
        const response = await axios.get(`/api/map/${project._id}`)
        if (response.status === 200){
          console.log(response.data);
          setMetaTagSuggestionMap(Object.fromEntries(response.data.map_keys.map(key => ([[key], {}]))))
          setBgColourMap(response.data.colour_map);
          setActiveMaps(Object.keys(response.data.contents).filter(key => response.data.contents[key].active));
          setMapsLoaded(true);
          console.log('active maps', Object.keys(response.data.contents).filter(key => response.data.contents[key].active))

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
          setCurrentTexts(response.data);
          setLoaded(true);
        }
      }

    fetchData();
  }, [page, pageLimit, saveTrigger]) // , tokenize// TODO review when implemented correctly.



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

  useEffect(() => {
    // Checks if text has been annotated
    const updateTextAnnotationStates = async () => {
      if (currentTexts){
        await axios.patch('/api/text/check-annotations/', { textIds: currentTexts.map(text => text._id) });
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
          currentTexts.map((text, textIndex) => {

            const textProps = {
                    project,
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
                    setToastInfo,
                    saveTrigger,
                    activeMaps
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
                  { tokenize !== text._id ? <CgMergeVertical/> : <CgMoreVertical/> }
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
