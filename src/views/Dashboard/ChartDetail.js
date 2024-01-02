import {
    Button,
    Col,
    Form,
    Input,
    Row,
    Select,
    Collapse,
    Popconfirm,
    Tooltip,
    Breadcrumb,
    message,
    InputNumber
} from "antd";
import {useEffect, useState} from "react";
import {CloseOutlined, PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {Link, useNavigate, useParams} from "react-router-dom";
import {aggregationTypeOptions, chartTypeOptions} from "./config";

function ChartDetail() {
    const [form] = Form.useForm()
    const [chartParams, setChartParams] = useState(
        {id: 0, name:"", type:"line", aggregation: "sum", down_sample:"10s", topn_limit:10})
    const [lineList, setLineList] = useState([{name:'', metric:'', tags:{}, offset:0}])
    const [activeKeys, setActiveKeys] = useState(['0'])
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        console.log(`reload page, dashboardId=${params.dashboardId}, chartId=${params.chartId}`)
        let chartId = parseInt(params.chartId)
        if (chartId !== 0) {
            fetch(`/server/api/chart?id=${chartId}`)
                .then(response => response.json())
                .then(response => {
                    if (response['code'] === 0) {
                        let chart = response['data']
                        let lines = chart.lines
                        for (let i = 0; i < lines.length; i++) {
                            lines[i].tags = JSON.parse(lines[i].tags)
                        }

                        setChartParams(chart)
                        setLineList(lines)
                    } else {
                        message.error("save chart failed " + response['msg'], 3)
                        console.error("save chart failed: " + response['msg'])
                    }
                }).catch((reason) => {
                message.error("save chart failed: " + reason, 3)
                console.error(reason)
            })
        }
    }, [])

    function onChartTypeChange(option) {
        chartParams.type = option.value
        setChartParams(chartParams)
    }

    function onAggregationTypeChange(option) {
        chartParams.aggregation = option.value
        setChartParams(chartParams)
    }

    function onSaveChart() {
        form.validateFields()
            .then((values) => {
                console.log(values);

                chartParams.id = parseInt(params.chartId)
                chartParams.dashboard_id = parseInt(params.dashboardId)
                chartParams.name = values.chartName
                chartParams.down_sample = values.down_sample
                if (chartParams.type === 'topN') {
                    chartParams.topn_limit = values.topnCount
                }
                chartParams.lines = [...lineList]

                for (let i = 0; i < chartParams.lines.length; i++) {
                    chartParams.lines[i].tags = JSON.stringify(chartParams.lines[i].tags)
                }

                fetch("/server/api/chart", {
                    method: chartParams.id === 0 ? "PUT" : "POST",
                    body: JSON.stringify(chartParams)
                }).then(response => response.json())
                    .then(response => {
                        if (response['code'] === 0) {
                            message.success("save chart success", 3)
                            navigate(`/dashboard/${params.dashboardId}`)
                        } else {
                            message.error("save chart failed " + response['msg'], 3)
                            console.error("save chart failed: " + response['msg'])
                        }
                    }).catch((reason) => {
                        message.error("save chart failed: " + reason, 3)
                        console.error(reason)
                    })

            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    function handleAddLine() {
        console.log("handleAddLine")
        setLineList(prevLineList => [...prevLineList, {name:'', metric:'', tags:{}, offset:0}])
        setActiveKeys(prevActiveKeys => [...prevActiveKeys, lineList.length.toString()])
    }

    function handleCopyLine(e, index) {
        // see: https://github.com/ant-design/ant-design/issues/15240
        e.stopPropagation()

        console.log(`handleCopyLine ${index}`)
        setLineList(prevLineList => [...prevLineList, {...prevLineList[index], id:0}])
        setActiveKeys(prevActiveKey => [...prevActiveKey, lineList.length.toString()])
    }

    function handleDeleteLine(e, index) {
        e.stopPropagation()

        console.log(`handleDeleteLine ${index}`)
        activeKeys.splice(index, 1)
        for (let i = index; i < activeKeys.length; i++) {
            activeKeys[i] = (parseInt(activeKeys[i]) - 1).toString()
        }
        setLineList(prevLineList => prevLineList.filter((line, i) => i !== index))
        setActiveKeys(activeKeys)
    }

    function handleAddTag(index) {
        console.log(`handleAddTag for line ${index}`)
        if ('' in lineList[index].tags) {
            console.log("has empty tag already")
            return
        }

        let newLineList = [...lineList]
        newLineList[index].tags[''] = ''
        setLineList(newLineList)
    }

    function handleDelTag(index, key) {
        console.log(`handleDelTag index=${index} key=${key}`)

        let newLineList = [...lineList]
        delete newLineList[index].tags[key]
        setLineList(newLineList)
    }

    function handleTagKey(index, oldKey, newKey) {
        console.log(`handleTagKey index=${index} oldKe=${oldKey} newKey=${newKey}`)

        let newLineList = [...lineList]
        newLineList[index].tags[newKey] = newLineList[index].tags[oldKey]
        delete newLineList[index].tags[oldKey]
        setLineList(newLineList)
    }

    function handleTagValue(index, key, value) {
        console.log(`handleTagValue index=${index} key=${key} value=${value}`)

        let newLineList = [...lineList]
        newLineList[index].tags[key] = value
        setLineList(newLineList)
    }

    function onLineChange(index, key, v) {
        console.log(`onLineChange, index=${index} key=${key}, v=${v}`)

        let newLineList = [...lineList]
        newLineList[index][key] = v
        setLineList(newLineList)
    }

    function handleActiveKey(activeKey) {
        console.log(`activeKey=${activeKey}`)
        let newActiveKeys = [...activeKey.sort()]
        if (newActiveKeys.length > lineList.length) {
            newActiveKeys.splice(lineList.length)
        }
        setActiveKeys(newActiveKeys)
    }

    function transferTags(data, index){
        let tagsList= [];
        let count= 0;
        if (typeof(data) === 'string') {
            data = JSON.parse(data);
        }

        let len = Object.getOwnPropertyNames(data).length;
        for (let p in data) {
            count++;
            tagsList.push(
                <div key={count} className="m-t-5 m-r-5" style={{display:'inline-block'}}>
                    <Input style={{ width: 100, textAlign: 'center' }} value={p} onChange={e=>handleTagKey(index, p, e.target.value)} placeholder="key" />
                    <Input style={{ width: 24, pointerEvents: 'none', borderLeft: 0 }} placeholder=":" disabled/>
                    <Input style={{ width: 180, textAlign: 'center', borderLeft: 0 }} value={data[p]} onChange={e => handleTagValue(index, p, e.target.value)} placeholder="value" />
                    {count === len &&
                        <Button type="primary" size="small" className="m-l-5" onClick={() => handleAddTag(index)}>
                            <PlusOutlined/>
                        </Button>
                    }
                    <Button type="primary" danger={true} size="small" onClick={() => handleDelTag(index, p)}><CloseOutlined/></Button>
                </div>
            )
        }
        if (tagsList.length === 0) {
            tagsList.push(
                <Button type="primary" size="small" className="m-l-5" key={count} onClick={()=>handleAddTag(index)}>
                    <PlusOutlined />
                </Button>
            )
        }
        return tagsList;
    }

    console.log(chartParams)
    console.log(lineList)
    console.log(activeKeys)

    form.setFieldsValue({
        chartName: chartParams.name,
        chartType: {label:chartParams.type, value:chartParams.type},
        aggregationType: {label:chartParams.aggregation, value:chartParams.aggregation},
        down_sample: chartParams.down_sample,
    })

    let lineEditList = lineList.map((line, index) => {
        form.setFieldValue("name." + index, line.name)
        form.setFieldValue("metric." + index, line.metric)
        form.setFieldValue("offset." + index, line.offset)

        return {
            key : index,
            label : line.name ? line.name : "line" + index,
            extra:
                <Row>
                    <Button type="primary" size="small" onClick={(e) => handleCopyLine(e, index)}>Copy Line</Button>
                    &nbsp;
                    <Popconfirm placement="leftTop" title={"Are you sure to delete this line?"}
                                onConfirm={(e) => handleDeleteLine(e, index)}>
                        <Button type="primary" size="small" danger={true} onClick={e=> e.stopPropagation()}>Delete Line</Button>
                    </Popconfirm>
                </Row>,
            children:
                <div key={index}>
                    <Row gutter={16} >
                        <Col span={8}>
                            <Form.Item
                                key={index}
                                name={"name." + index}
                                label="Line Name"
                                initialValue={line.name}
                                rules={[
                                    {
                                        required: true,
                                        message: "please input line name",
                                    },
                                ]}
                            >
                                <Input key={index} onChange={(e)=>onLineChange(index, 'name', e.target.value)}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                key={index}
                                name={"metric." + index}
                                label="Metric Name"
                                initialValue={line.metric}
                                rules={[
                                    {
                                        required: true,
                                        message: "please input metric name",
                                    },
                                ]}
                            >
                                <Input key={index} onChange={(e)=>onLineChange(index, 'metric', e.target.value)}/>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                key={index}
                                label={(
                                    <span>
                                    Days Ago &nbsp;
                                        <Tooltip placement="top" title="0 for current day,-1 for a day ago ...">
                                        <QuestionCircleOutlined/>
                                    </Tooltip>
                                </span>
                                )}
                                name={"offset."+index}
                                initialValue={line.offset}
                                rules={[
                                    {
                                        required: true,
                                        message: "please input offset days",
                                    },
                                ]}
                            >
                                <InputNumber key={index} onChange={(value)=>onLineChange(index, 'offset', value)}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                key={index}
                                label='Tags'
                                labelCol={{span: 2}}
                                wrapperCol={{span: 22}}
                                style={{marginBottom: 8}}
                            >
                                {transferTags(line.tags, index)}
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            }
        }
    )

    let breadItems = [
        {title: <Link to="/">Home</Link>},
        {title: <Link to="/dashboard">Dashboard</Link>},
        {title: <Link to={`/dashboard/${params.dashboardId}/chart/${params.chartId}`}>chart</Link>}
    ]

    return (
        <div>
            <Row>
                <Breadcrumb items={breadItems} />
            </Row>

            &nbsp;&nbsp;

            <Form
                form={form}
                layout="horizontal"
                name="form_in_modal"
                initialValues={{
                    modifier: 'public',
                }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="chartName"
                            label="Chart Name"
                            initialValue={chartParams.name}
                            rules={[
                                {
                                    required: true,
                                    message: "please input chart name",
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="chartType"
                            label="Chart Type"
                            initialValue={{label:chartParams.type, value:chartParams.type}}
                            rules={[
                                {
                                    required: true,
                                    message: "please input chart type",
                                },
                            ]}
                        >
                            <Select  labelInValue={true}
                                     style={{display:"block"}}
                                     options={chartTypeOptions}
                                     onChange={onChartTypeChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name="aggregationType"
                            label="Aggregation Type"
                            initialValue={{label:chartParams.aggregation, value:chartParams.aggregation}}
                            rules={[
                                {
                                    required: true,
                                    message: "please input aggregation type",
                                },
                            ]}
                        >
                            <Select  labelInValue={true}
                                     style={{display:"block"}}
                                     options={aggregationTypeOptions}
                                     onChange={onAggregationTypeChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="down_sample"
                            label="DownSample"
                            initialValue={chartParams.down_sample}
                            rules={[
                                {
                                    required: true,
                                    message: "please input down sample",
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    {chartParams.type === "topN" && <Col span={8}>
                        <Form.Item
                            name="topnCount"
                            label="topN Count"
                            initialValue={chartParams.topn_limit}
                            rules={[
                                {
                                    required: true,
                                    message: "please input topN count",
                                },
                            ]}
                        >
                            <InputNumber/>
                        </Form.Item>
                    </Col>}

                    <Col span={8} >
                        <Button type={"primary"} onClick={handleAddLine} >New Line</Button>
                    </Col>
                </Row>

                <Collapse items={lineEditList} activeKey={activeKeys} onChange={handleActiveKey}/>

                &nbsp;&nbsp;
                <Row justify={"center"}>
                    <Button type={"primary"}  onClick={onSaveChart}>Save Chart</Button>
                </Row>
            </Form>
        </div>
    )
}

export default ChartDetail
