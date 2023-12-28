import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Chart from "./Chart";
import {Button, Card, DatePicker, FloatButton, message, Select, Space, Tooltip} from "antd";
import React, {useEffect, useState} from "react";
import {Responsive, WidthProvider} from "react-grid-layout";
import {autoRefreshOptions, timeSelect} from "./config";
import {
    DeleteOutlined,
    EditOutlined,
    LineChartOutlined, MenuOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const ResponsiveGridLayout = WidthProvider(Responsive);
const chartGridStyle = {width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}
const HeightUnit = 80

function getCurrentTimestamp() {
    return Math.floor(new Date().getTime() / 1000)
}

function DashboardDetail({dashboard}) {
    const [layout, setLayout] = useState(JSON.parse(dashboard.chart_layout))
    const [timeOption, setTimeOption] = useState({label:'Last 1 hour', value: '60'})
    const [autoRefreshOption, setAutoRefreshOption] = useState({label:'Off', value: '0'})
    const [autoRefreshId, setAutoRefreshId] = useState(0)
    const [timeRange, setTimeRange] = useState({start: getCurrentTimestamp() - 3600, end: getCurrentTimestamp()})
    const [showCustom, setShowCustom] = useState(false)
    const [chartList, setChartList] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetch("/server/api/chartList", {
            method: "POST",
            body: JSON.stringify({"dashboard_id": dashboard.id})
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    setChartList(response['data'])
                    setLayout(JSON.parse(dashboard.chart_layout))
                } else {
                    let msg = "get chart list failed " + response['msg']
                    message.error(msg, 3)
                    console.error(msg)
                }
            }).catch((reason) => {
                let msg = "get chart list failed " + reason
                message.error(msg, 3)
                console.error(msg)
            })
    }, [dashboard.id])

    function onLayoutChange(newLayout) {
        console.log("onLayoutChange, newLayout=" + newLayout)
        setLayout(newLayout)
    }

    function handleTime(option) {
        setTimeOption(option)
        if (option.label === "custom") {
            setShowCustom(true)
        } else {
            setShowCustom(false)
            let currentTime = getCurrentTimestamp()
            setTimeRange({start: currentTime - parseInt(option.value) * 60, end: currentTime})
        }
    }

    function handleCustom(value) {
        console.log("handleCustom: from=" + new Date(value[0]).toLocaleString() + ", to=" + new Date(value[1]).toLocaleString())
        let startTime = Math.floor(new Date(value[0]).getTime() / 1000)
        let endTime = Math.floor(new Date(value[1]).getTime() / 1000)
        setTimeRange({start: startTime, end: endTime})
    }

    function handleAutoRefresh(option) {
        setAutoRefreshOption(option)

        if (autoRefreshId !== 0) {
            window.clearInterval(autoRefreshId)
        }

        if (option.value !== '0') {
            let refreshId = window.setInterval(handleRefresh, parseInt(option.value) * 1000)
            setAutoRefreshId(refreshId)
        } else {
            setAutoRefreshId(0)
        }
    }

    function handleRefresh() {
        if (timeOption.label !== "custom") {
            let currentTime = getCurrentTimestamp()
            setTimeRange({start: currentTime - parseInt(timeOption.value) * 60, end: currentTime})
        }
    }

    function handleAddChart() {
        console.log(`add chart for ${dashboard.name}`)
        navigate(`/dashboard/${dashboard.id}/chart/create`)
    }

    function handleEditChart() {
        console.log(`edit chart for ${dashboard.name}`)
    }

    function handleDeleteChart() {
        console.log(`delete chart for ${dashboard.name}`)
    }

    function handleChangeLayout() {
        console.log(`handle change layout for ${dashboard.name}`)

        setLayout((prevLayouts) => prevLayouts.map((item)=> {
            return {...item, ...{ static: false}}
        }))
    }

    function handleSaveLayout() {
        console.log(`save layout for ${dashboard.name}`)

        let newLayout = layout.map((item)=> {
            return {...item, ...{ static: true}}
        });

        setLayout(newLayout)

        dashboard.chart_layout = newLayout

        let record = {...dashboard}
        record.chart_layout = JSON.stringify(record.chart_layout)
        fetch("/server/api/dashboard", {
            method: "POST",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("update dashboard layout success", 3)
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)
    }

    let operateList= <div>
        <span>Time: </span>
        <Select labelInValue={true}
                style={{width:150}}
                value={timeOption.label}
                optionLabelProp="label"
                optionFilterProp="label"
                onChange={handleTime}
                options={timeSelect}
        />

        &nbsp;&nbsp;
        {showCustom &&
            <DatePicker.RangePicker
                showTime={{
                    format:"HH:mm:ss"
                }}
                showToday={true}
                format="YYYY-MM-DD HH:mm:ss"
                onOk={handleCustom}
            />
        }
        &nbsp;&nbsp;
        <Select labelInValue={true}
                style={{width:80}}
                value={autoRefreshOption.label}
                optionLabelProp="label"
                optionFilterProp="label"
                onChange={handleAutoRefresh}
                options={autoRefreshOptions}
        />
        &nbsp;&nbsp;
        <Tooltip title={"Refresh"}>
            <Button type={"primary"} onClick={handleRefresh} shape={"circle"} icon={<ReloadOutlined/>}/>
        </Tooltip>
    </div>;
    
    let inChangeLayout = layout.length > 0 && !layout[0].static
    let chartGridList = chartList.map(chart =>
        <div key={chart.id} style={chartGridStyle}>
            <FloatButton.Group
                trigger="hover"
                type="primary"
                icon={<MenuOutlined />}
            >
                <FloatButton icon={<EditOutlined/>} onClick={handleEditChart}/>
                <FloatButton icon={<DeleteOutlined/>} onClick={handleDeleteChart}/>
            </FloatButton.Group>

            <Chart timeRange={timeRange}  chart={chart}/>
        </div>
    )

    console.log("layout=" + JSON.stringify(layout))

    return (
        <div>
            <Card title={dashboard.name} bordered={false} extra={operateList}>
                <Space direction={"horizontal"} size={"middle"}>
                    <Button icon={<LineChartOutlined/>} type={"primary"} onClick={handleAddChart}>Add Chart</Button>

                    {!inChangeLayout && <Button type={"primary"} onClick={handleChangeLayout} >Change Layout</Button>}
                    {inChangeLayout && <Button type={"primary"} onClick={handleSaveLayout} >Save Layout</Button>}
                </Space>
                &nbsp;&nbsp;

                <ResponsiveGridLayout
                    className="layout"
                    layouts={{"lg":layout}}
                    preventCollision={true}
                    autoSize={true}
                    rowHeight={HeightUnit}
                    breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                    onLayoutChange={onLayoutChange}
                >
                    {chartGridList}
                </ResponsiveGridLayout>
            </Card>
        </div>
    )
}

export default DashboardDetail;