import React, { useState } from 'react'
import axios from "../common/utils/api-interceptor";
import history from "../common/utils/history";
import { Button, Form, Col, Row, Table, OverlayTrigger, Popover, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { MdAddCircle, MdRemoveCircle, MdBrush } from 'react-icons/md';
import { IoInformationCircleSharp } from 'react-icons/io5';
import { CompactPicker } from 'react-color';


const DEFAULT_COLOUR = "#9B9B9B"
const REPLACE_COLOUR = "#99BF9C"
const infoContent = {
  "raw_text": {
    "title": "Raw Text Documents",
    "content": "Raw text documents are those that will be annotated for lexical normalisation.",
    "format":".txt\nhelo wor\nhello worl\n..."
  },
  "replacements": {
    "title": "Replacements",
    "content": "Replacements should be in the form of a 1:1 (IV:OOV) mapping.",
    "format": '.csv\nhelo,hello\nwor,world\n...\n\n.json\n{"helo":"hello", "wor":"world", ...}'
  },
  "meta_tags": {
    "title": "Meta Tags",
    "content": "Meta tags are used to give tokens contextual classifications.\nHere meta tag classes can be specified and a gazetteer uploaded (if available in .txt file format).",
    "format": ".txt\nc/o\no/h\nu/s\n"
  }
}

const DEFAULT_REMOVE_CHARS = '~",?;!:()[]_{}*.$'

const schema = yup.object().shape({
    projectName: yup.string().required(),
    projectDescription: yup.string().required(),
  });
  
export default function UploadForm({ setShowUpload, setIsSubmitting }) {
    const [fileData, setFileData] = useState({'textFile': {'meta': null, 'data': null}, 'rpFile': {'meta': null, 'data': null}})
    const [dataFileLoaded, setDataFileLoaded] = useState(false);
    
    // States for handling metatag creation
    const [tempMetaTag, setTempMetaTag] = useState('');
    const [tempData, setTempData] = useState({meta: null, data: null});
    const [tempColour, setTempColour] = useState(DEFAULT_COLOUR)
    const [metaTags, setMetaTags] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Preprocessing
    const [charsRemove, setCharsRemove] = useState(DEFAULT_REMOVE_CHARS);
    
    const readFile = (fileKey, fileMeta) => {
        let reader = new FileReader();
        reader.readAsText(fileMeta);
        reader.onload = () => {
            // console.log(fileMeta)
            const fileExtension = fileMeta.name.split('.').slice(-1)[0];

            // TODO: Check whether file is valid for the action being performed

            if (fileExtension === 'txt'){
                // Split lines and remove any documents that are empty
                const newFileData = {"meta": fileMeta, "data": reader.result.split('\n').filter(line => line !== "")}
                // console.log('file data for', fileKey, newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))
                if (fileKey === 'textFile'){
                  // console.log('input data', newFileData);
                  setDataFileLoaded(true);
                }

                setTempData(prevState => ({...prevState, [fileKey]: newFileData}))  // NEW


            } else if (fileExtension === 'json'){
                // JSON is read as a string - converts to Object
                const newFileData = {"meta": fileMeta, "data": JSON.parse(reader.result)}
                console.log('json data', newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))


            } else if (fileExtension === 'csv'){
                // console.log('reading .csv')
                // console.log(reader.result);

                // Process CSV by splitting on \n and then splitting on commas
                // Skips empty rows
                // Rows will the be used to build 
                // TODO: investigate if this process needs to be made async...
                const rowsObject = reader.result.split('\n').filter(line => line !== "").map(line => ({[line.split(',')[0].trim()]: line.split(',')[1].trim()}));
                // console.log(rowsObject);

                // Combine row objects into { str2: str1} objects
                const csvData = Object.assign({}, ...rowsObject);
                
                // console.log(csvData);
                const newFileData = {"meta": fileMeta, "data": csvData};
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}));
            }
        }
    }


    const addMetaTag = () => {
      // console.log('adding meta tag')
      // console.log(tempMetaTag)
      if (tempMetaTag !== '' && tempData){
        // console.log('adding ', tempData, 'to meta tags')
        if (Object.keys(tempData).includes(tempMetaTag)){
          tempData[tempMetaTag]['colour'] = tempColour
          // console.log(tempData);
          setMetaTags(prevState => ({...prevState, ...tempData}));
        } else {
          setMetaTags(prevState => ({...prevState, [tempMetaTag]: {meta: null, data: [], colour: tempColour}}))
        }

        // Reset states
        setTempMetaTag('');
        setTempColour(DEFAULT_COLOUR)
        document.getElementById('formControlTempMetaTag').value = null; // essentially resets form
        setTempData({meta: null, data: null, colour: null});
      } 
    }

    const removeMetaTag = (tagName) => {
      // console.log(`removing ${tagName} tag`);
      setMetaTags(prevState => Object.fromEntries(Object.entries(prevState).filter(([key, value]) => key !== tagName)));
      // console.log(metaTags);
    }

    const createProject = async (values) => {
        if (fileData['textFile'].data.length > 0){
          // Only require raw texts, users might not have any other artifacts.
          const maps = Object.keys(metaTags).map(tagKey => ({"type": tagKey, "colour": metaTags[tagKey].colour, "tokens": metaTags[tagKey].data, "active": true}))

          if (fileData["rpFile"] && fileData["rpFile"].data && Object.keys(fileData["rpFile"].data).length > 0){
            // add replacements to maps if they exist
            maps.push({"type": "rp", "colour": REPLACE_COLOUR, "replacements": fileData["rpFile"].data, "active": true})
          } else {
            maps.push({"type": "rp", "colour": REPLACE_COLOUR, "replacements": {}, "active": true})
          }

          const formPayload = {
            token: window.localStorage.getItem('token'),
            name: values.projectName,
            description: values.projectDescription,
            texts: fileData['textFile'].data,
            maps: maps,
            lower_case: values.lowerCase,
            remove_duplicates: values.removeDuplicates,
            detect_digits: values.detectDigits,
            chars_remove: values.charsRemove
          }

          console.log('Form payload ->', formPayload)
          if (formSubmitted === false){
            setIsSubmitting(true);
            await axios.post('/api/project/create', formPayload)
            .then(response => {
                if (response.status === 200){
                setFormSubmitted(true);
                setShowUpload(false);
                }
            })
            .catch(error => {
                if (error.response.status === 401 || 403){
                    console.log('unauthorized')
                    history.push('/unauthorized');
                }
            });
          }
        }
    }


    const popover = (<Popover id="popover-colour">
                      <Popover.Title>
                        Select Colour
                        </Popover.Title>
                      <Popover.Content>
                        <CompactPicker
                          color={tempColour}
                          onChange={color => setTempColour(color.hex)}
                          onChangeComplete={color => setTempColour(color.hex)}
                        />
                      </Popover.Content>
                    </Popover>)

    const infoPopover = (content, format) => {
    return(<Popover id="popover-info">
      <Popover.Title>
        Information
      </Popover.Title>
      <Popover.Content>
        <p>{content}</p>
        <code style={{whiteSpace: 'pre-wrap'}}>{format}</code>
      </Popover.Content>
    </Popover>
    )}

    const infoOverlay = (info) => {
      return(<div style={{ display: 'flex'}}>
              <p> { info.title }</p>
              <OverlayTrigger
                trigger="click"
                placement="right"
                overlay={infoPopover(info.content, info.format)}
              >
                <IoInformationCircleSharp style={{marginLeft: '2px', color: 'grey'}} />
              </OverlayTrigger>
            </div>
            )}


    return (
    <Formik
      validationSchema={schema}
      onSubmit={(values) => createProject(values)}
      initialValues={{
        projectName: '',
        projectDescription: '',
        lowerCase: true,
        removeDuplicates: true,
        detectDigits: false,
        charsRemove: DEFAULT_REMOVE_CHARS
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        isValid,
        errors,
        setFieldValue
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <p style={{fontSize: '18px', fontWeight: 'bold', marginTop: '0.5em'}}>Project Details</p>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik01">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                name="projectName"
                value={values.projectName}
                onChange={handleChange}
                autoComplete = 'off'
                isValid={touched.projectName && !errors.projectName}
                isInvalid={touched.projectName && errors.projectName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectName}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik02">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="projectDescription"
                value={values.projectDescription}
                onChange={handleChange}
                autoComplete = 'off'
                isValid={touched.projectDescription && !errors.projectDescription}
                isInvalid={touched.projectDescription && errors.projectDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectDescription}
              </Form.Control.Feedback>
            </Form.Group>
        </Form.Row>

        <p style={{fontSize: '18px', fontWeight: 'bold', marginTop: '0.5em'}}>Upload</p>
        <Form.Group>
          <Form.Row>
                <Col>
                    { infoOverlay(infoContent['raw_text']) }
                    <Form.File
                        id="exampleFormControlFile1"
                        onChange={(e) => setFileData(prevState => ({...prevState, "textFile": {"meta": e.target.files[0], "data": readFile("textFile", e.target.files[0])}}))}
                    />
                    <Form.Text id="rawtextHelpBlock" muted>
                        File format (.txt)
                    </Form.Text>
                </Col>
                <Col>
                  { infoOverlay(infoContent['replacements']) }
                    <Form.File
                        id="exampleFormControlFile3"
                        onChange={(e) => setFileData(prevState => ({...prevState, "rpFile": {"meta": e.target.files[0], "data": readFile("rpFile", e.target.files[0])}}))}
                        />
                    <Form.Text id="replacementHelpBlock" muted>
                        File format (.csv or .json) 
                    </Form.Text>
                </Col>
            </Form.Row>
        </Form.Group>

        { infoOverlay(infoContent['meta_tags']) }
        <Table striped bordered hover size="sm" style={{fontSize: '14px', marginBottom: '0em'}}>
          <thead style={{textAlign: 'center'}}>
            <tr>
              <th>Tag Name</th>
              <th>Gazetteer</th>
              <th>Colour</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody style={{textAlign: 'center', height: '5vh', overflow: 'auto'}}>
            <tr>
              <td>
                <input type="text" style={{width: '8em'}} value={tempMetaTag} onChange={e => setTempMetaTag(e.target.value)}/>
                </td>
              <td>
                <Form.File
                    id="formControlTempMetaTag"
                    onChange={(e) => setTempData({[tempMetaTag]: {"meta": e.target.files[0], "data": readFile(tempMetaTag, e.target.files[0])}})}
                />
              </td>
              <td>
                <OverlayTrigger trigger="click" placement="left" overlay={popover}>
                  <Button style={{borderColor: tempColour, backgroundColor: tempColour, padding: '0.2em'}}>
                    <MdBrush/>
                  </Button>
                </OverlayTrigger>
              </td>
              <td>
                {
                  tempMetaTag !== '' ?
                  <MdAddCircle style={{fontSize: '22px', color: '#28a745'}} onClick={() => addMetaTag()}/>
                  : null
                }
              </td>
            </tr>
            {
              Object.keys(metaTags).length > 0?
              Object.keys(metaTags).map(key => (<tr>
                <td>{key}</td>
                <td>{metaTags[key].meta ? metaTags[key].meta.name : 'No data uploaded'}</td>
                <td>
                  <Button style={{borderColor: metaTags[key].colour, backgroundColor: metaTags[key].colour, padding: '0.2em'}}>
                    <MdBrush style={{color: 'white'}}/>
                  </Button>
                </td>
                <td>
                  <MdRemoveCircle style={{fontSize: '22px', color: '#dc3545'}} onClick={() => removeMetaTag(key)}/>
                </td>
              </tr>))
              : null
            }
          </tbody>
        </Table>
        <p style={{fontSize: '10px', color: 'grey', marginBottom: '0.5em'}}>Note: Tag names must have underscores instead of white space and gazetteers must be in .txt file format</p>
        
        <p style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '0em'}}>Text Preprocessing</p>
        <p style={{fontSize: '14px', color: 'grey', marginBottom: '1em'}}>Select preprocessing actions to be applied to raw text documents</p>

          <Form.Group as={Row}>
            <Form.Label column sm={3} style={{textAlign: 'right'}}>
              Actions
            </Form.Label>
            <Col sm={9}>
              <Form.Check
                type="checkbox"
                label="Lower case"
                name="lowerCaseCheck"
                style={{fontSize: '14px'}}
                checked={values.lowerCase}
                onChange={e => setFieldValue('lowerCase', e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                label="Remove duplicates"
                name="removeDuplicatesCheck"
                style={{fontSize: '14px'}}
                checked={values.removeDuplicates}
                onChange={e => setFieldValue('removeDuplicates', e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                label="Label digits as in-vocabulary"
                name="detectDigitsCheck"
                style={{fontSize: '14px'}}
                checked={values.detectDigits}
                onChange={e => setFieldValue('detectDigits', e.target.checked)}
              />
            </Col>

          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label column sm={3} style={{textAlign: 'right'}}>
              Remove Characters
            </Form.Label>
            <Col sm={9} style={{margin: 'auto'}}>
                <Form.Control
                  type="text"
                  placeholder={values.charsRemove}
                  name="charsRemove"
                  value={values.charsRemove}
                  onChange={handleChange}
                  autoComplete = 'off'
                  style={{fontSize: '14px'}}
                />
              </Col>

          </Form.Group>
        
        <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: '4em'}}>
          <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button type="submit" variant="dark">Create Project</Button>
        </div>

        </Form>
      )}
    </Formik>
    )
}
