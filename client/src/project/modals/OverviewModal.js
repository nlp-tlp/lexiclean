// https://github.com/uber/react-vis/blob/master/packages/showcase/plot/labeled-heatmap.js
import React, { useState, useEffect } from 'react'
import axios from "../../common/utils/api-interceptor";
import { Modal, Button, Spinner } from 'react-bootstrap';
import { XYPlot, XAxis, YAxis, HeatmapSeries, Hint, LabelSeries, ChartLabel, LineSeries} from 'react-vis';

export default function OverviewModal({showOverview, setShowOverview, projectId, pageLimit}) {
    const [seriesType, setSeriesType] = useState()
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`/api/text/overview/${projectId}`, { params: {limit: pageLimit }})
            if(response.status === 200){
                setSeriesType(response.data.type);
                setData(response.data.data)
                setLoading(false);
            }
        }
        fetchData();
    }, [showOverview, projectId])

    return (
        <Modal
            show={showOverview}
            onHide={() => setShowOverview(false)}
            backdrop="static"
            keyboard={false}
            size="lg"            
        >
            <Modal.Header closeButton>
                <Modal.Title>Overview (experimental)</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {
                    (loading && !data && !seriesType) ? 
                    <div style={{textAlign: 'center', margin: 'auto', marginTop: '4em', marginBottom: '4em'}}>
                        <p style={{fontSize: '18px'}}>Loading overview - this may take a minute...</p>
                        <Spinner animation="border" />
                    </div>
                    :
                    <div>
                        <h2>{ seriesType }</h2>
                        <p>This modal gives you an overview of your normalisation dataset</p>
                        <div style={{textAlign: 'center'}}>
                            <XYPlot width={700} height={500}>
                                <XAxis/>
                                <YAxis/>
                                <ChartLabel
                                    text={seriesType === "heatmap" ? "Text Number" : "Page Number"}
                                    className="alt-x-label"
                                    xPercent={0.44}
                                    yPercent={0.86}
                                />
                                <ChartLabel
                                    text={seriesType === "heatmap" ? "Page Number": "Ave Candidates"}
                                    className="alt-y-label"
                                    xPercent={0.02}
                                    yPercent={0.45}
                                    style={{
                                        transform: 'rotate(-90)',
                                    }}
                                />
                                {
                                    seriesType === 'heatmap'
                                    ?
                                    <HeatmapSeries
                                        style={{
                                            stroke: 'white',
                                            strokeWidth: '2px'
                                        }}
                                        colorRange={["#D9D9D9", "#F2A477"]}
                                        data={data}
                                        onValueMouseOver={v => setValue(v)}
                                        onSeriesMouseOut={() => setValue(false)}
                                    />
                                    :
                                    null
                                    
                                }
                                {
                                    seriesType === 'heatmap' 
                                    ?
                                    <LabelSeries
                                        style={{pointerEvents: 'none', fontSize: '10px'}}
                                        data={data}
                                        labelAnchorX="middle"
                                        labelAnchorY="baseline"
                                        getLabel={d => `${d.color}`}
                                    />
                                    : 
                                    null
                                }
                                {
                                    seriesType === 'line'?
                                    <LineSeries
                                        data={data}
                                        color="#F2A477"

                                    />
                                    :
                                    null
                                }

                                {value !== false && <Hint value={value} />}
                            </XYPlot>
                        </div>
                    </div>
                }
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={() => setShowOverview(false)}>Return</Button>
            </Modal.Footer>
        </Modal>
    )
}
