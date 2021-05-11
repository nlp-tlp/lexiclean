import React, { useState } from 'react'
import { Button, Form, Col, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

const schema = yup.object().shape({
    projectName: yup.string().required(),
    projectDescription: yup.string().required(),
  });
  
export default function UploadForm({ setShowUpload, setIsSubmitting }) {
    const [fileData, setFileData] = useState({'textFile': {'meta': null, 'data': null},
                                              'dsWordFile': {'meta': null, 'data': null},
                                              'abrvWordFile': {'meta': null, 'data': null},
                                              'rpFile': {'meta': null, 'data': null}
                                            })
    
    const [dataFileLoaded, setDataFileLoaded] = useState(false);
    const [dsWordFileLoaded, setDsWordFileLoaded] = useState(false);
    const [abrvWordFileLoaded, setAbrvWordFileLoaded] = useState(false);
    const [rpFileLoaded, setRpWordFileLoaded] = useState(false);

    const [formSubmitted, setFormSubmitted] = useState(false);

    const readFile = (fileKey, fileMeta) => {
        let reader = new FileReader();
        reader.readAsText(fileMeta);
        reader.onload = () => {
            const fileExtension = fileMeta.name.split('.').slice(-1)[0];

            if (fileExtension === 'txt'){
                // Split lines and remove any documents that are empty
                const newFileData = {"meta": fileMeta, "data": reader.result.split('\n').filter(line => line !== "")}
                console.log(newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))

                if (fileKey === 'textFile'){
                    console.log('input data', newFileData);
                    setDataFileLoaded(true);

                } else if (fileKey === 'dsWordFile'){
                    console.log('ds data', newFileData);
                    setDsWordFileLoaded(true);

                }

            } else if (fileExtension === 'json'){
                // JSON is read as a string - converts to Object
                const newFileData = {"meta": fileMeta, "data": JSON.parse(reader.result)}
                console.log('json data', newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))

            } else if (fileExtension === 'csv'){
                console.log('reading .csv')
                // console.log(reader.result);

                // Process CSV by splitting on \n and then splitting on commas
                // Skips empty rows
                // Rows will the be used to build 
                // TODO: investigate if this process needs to be made async...
                const rowsObject = reader.result.split('\n').filter(line => line !== "").map(line => ({[line.split(',')[0].trim()]: line.split(',')[1].trim()}));
                // console.log(rowsObject);

                // Combine row objects into {str: [array]} objects, merging on the key
                const csvData = rowsObject.reduce((a, c) => {
                                                          Object.keys(c).forEach(k => (a[k] || (a[k] = [])).push(c[k]));
                                                          return a;
                                                      }, {});
                console.log(csvData);
                const newFileData = {"meta": fileMeta, "data": csvData};
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}));
            }
        }
    }

    const createProject = async (values) => {

        if (Object.keys(fileData).filter(file => fileData[file].data).length === Object.keys(fileData).length){
            console.log('all data processed')
            if (Object.values(values).length == Object.keys(values).length && dataFileLoaded && dsWordFileLoaded){
                console.log('form data ready');
                console.log('has form been submitted?', formSubmitted);

                const maps = [
                  {
                    "type": "ds",
                    "tokens": fileData['dsWordFile'].data
                  },
                  {
                    "type": "abrv",
                    "tokens": fileData['abrvWordFile'].data
                  },
                  {
                  "type": "rp",
                  "replacements": fileData['rpFile'].data
                  }
                ];

                const formPayload = {
                  name: values.projectName,
                  description: values.projectDescription,
                  texts: fileData['textFile'].data,
                  maps: maps
                }
                
                console.log('form payload', formPayload)

                if (formSubmitted === false){
                    console.log('submitting...')
                    setIsSubmitting(true);
                    const response = await axios.post('/api/project/create', formPayload)

                    if (response.status === 200){
                        console.log('response of create project', response);
                        setFormSubmitted(true);
                        setShowUpload(false);
                    }
                }

            }
        }

    }

    return (
    <Formik
      validationSchema={schema}
      onSubmit={(values) => createProject(values)}
      initialValues={{
        projectName: '',
        projectDescription: '',
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
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik01">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                name="projectName"
                value={values.projectName}
                onChange={handleChange}
                isValid={touched.projectName && !errors.projectName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectName}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik02">
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="projectDescription"
                value={values.projectDescription}
                onChange={handleChange}
                isValid={touched.projectDescription && !errors.projectDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectDescription}
              </Form.Control.Feedback>
            </Form.Group>
        </Form.Row>

        <Form.Group>
            <Form.Row>
                <Col>
                    <Form.File
                        id="exampleFormControlFile1"
                        label="Raw text documents"
                        onChange={(e) => setFileData(prevState => ({...prevState, "textFile": {"meta": e.target.files[0], "data": readFile("textFile", e.target.files[0])}}))}
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                        Raw text documents are those that will be annotated for lexical normalisation.
                        These should be in text (.txt) format.
                    </Form.Text>
                </Col>
                <Col>
                    <Form.File
                        id="exampleFormControlFile2"
                        label="Domain-specific words"
                        onChange={(e) => setFileData(prevState => ({...prevState, "dsWordFile": {"meta": e.target.files[0], "data": readFile("dsWordFile", e.target.files[0])}}))}
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                        Domain specific words should be in text (.txt) format.
                    </Form.Text>
                </Col>
            </Form.Row>
        </Form.Group>

        <Form.Group>
            <Form.Row>
                <Col>
                    <Form.File
                        id="exampleFormControlFile3"
                        label="Replacements"
                        onChange={(e) => setFileData(prevState => ({...prevState, "rpFile": {"meta": e.target.files[0], "data": readFile("rpFile", e.target.files[0])}}))}
                        />
                    <Form.Text id="passwordHelpBlock" muted>
                        Replacements should be in .csv or .json file format.
                    </Form.Text>
                </Col>
                
                <Col>
                    <Form.File
                        id="exampleFormControlFile4"
                        label="Abbreviations"
                        onChange={(e) => setFileData(prevState => ({...prevState, "abrvWordFile": {"meta": e.target.files[0], "data": readFile("abrvWordFile", e.target.files[0])}}))}
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                        Abbreviations should be in text (.txt) format.
                    </Form.Text>    
                </Col>
            </Form.Row>
        </Form.Group>

        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
          <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button type="submit">Create Project</Button>
        </div>

        </Form>
      )}
    </Formik>
    )
}
