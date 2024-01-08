import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Chart from "./Chart";
import {Button, Card, DatePicker, FloatButton, message, Popconfirm, Select, Tooltip} from "antd";
import React, {useEffect, useState} from "react";
import {Responsive, WidthProvider} from "react-grid-layout";
import {autoRefreshOptions, timeSelect} from "./config";
import {
    DeleteOutlined,
    EditOutlined,
    LineChartOutlined, LockOutlined, MenuOutlined,
    ReloadOutlined, UnlockOutlined
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const ResponsiveGridLayout = WidthProvider(Responsive);
const chartGridStyle = {overflow:'hidden', width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}
const HeightUnit = 80

function getCurrentTimestamp() {
    return Math.floor(new Date().getTime() / 1000)
}

function DashboardDetail({dashboard, onUpdateDashboard}) {
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
                    initLayout(response['data'], JSON.parse(dashboard.chart_layout))
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

    // after add chart the router will navigate to initialize dashboard,
    // so we need to add a new layout grid here
    function initLayout(chartList, oldLayout) {
        if (chartList.length === oldLayout.length) {
            setLayout(oldLayout)
        } else {
            // the new chart must the last in the array, and always add to the new grid at the bottom
            let newChart = chartList[chartList.length - 1]
            let maxHeight = 0
            for (let i = 0; i < oldLayout.length; i++) {
                if (oldLayout[i].y + oldLayout[i].h > maxHeight) {
                    maxHeight = oldLayout[i].y + oldLayout[i].h
                }
            }

            let newLayout = [...oldLayout, {w: 4, h: 4, x: 0, y: maxHeight, i: newChart.id.toString(), moved:false,static:true}]
            dashboard.chart_layout = JSON.stringify(newLayout)
            setLayout(JSON.parse(dashboard.chart_layout))
            onUpdateDashboard(dashboard)
        }
    }

    function onLayoutChange(newLayout, allLayouts) {
        console.log("onLayoutChange, newLayout=" + newLayout + ", allLayouts=" + allLayouts)
        for (let i = 0 ; i < newLayout.length; i++) {
            let item = newLayout[i]
            console.log("i=" + item.i + ", x=" + item.x + ", y=" + item.y + ",w="+ item.w + ",h=" + item.h)
            if (item.w === 1 && item.h === 1) {
                // filter layout change with buggy onLayoutChange
                return
            }
        }

        if (newLayout.length === chartList.length) {
            console.log("set new layout")
            setLayout(newLayout)
        }
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
        navigate(`/dashboard/${dashboard.id}/chart/0`) // chartId 0 means create chart
    }

    function handleEditChart(chart) {
        console.log(`edit chart for ${dashboard.name}.${chart.name}`)
        navigate(`/dashboard/${dashboard.id}/chart/${chart.id}`)
    }

    function handleDeleteChart(chart) {
        console.log(`delete chart for ${dashboard.name}.${chart.name}`)

        fetch("/server/api/chart", {
            method: "DELETE",
            body: JSON.stringify(chart)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("delete chart success", 3)
                    setChartList(prevChartList => prevChartList.filter(item => item.id !== chart.id))
                    let newLayout = layout.filter(item => parseInt(item.i) !== chart.id)
                    dashboard.chart_layout = JSON.stringify(newLayout)
                    setLayout(JSON.parse(dashboard.chart_layout))
                    onUpdateDashboard(dashboard)
                } else {
                    let errMsg = "delete chart failed: " + response['msg']
                    message.error(errMsg)
                    console.error(errMsg)
                }
            }).catch(reason => {
                let errMsg = "delete chart failed: " + reason
                message.error(errMsg)
                console.error(errMsg)
        })
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
            return {...item, static: true}
        });

        dashboard.chart_layout = JSON.stringify(newLayout)
        setLayout(newLayout)
        onUpdateDashboard(dashboard)
    }

    let inChangeLayout = layout.length > 0 && !layout[0].static
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
        &nbsp;&nbsp;
        <Tooltip title={"Add Chart"}>
            <Button type={"primary"} onClick={handleAddChart} shape={"circle"} icon={<LineChartOutlined/>}/>
        </Tooltip>
        &nbsp;&nbsp;
        {!inChangeLayout && <Tooltip title={"Change Layout"}>
            <Button type={"primary"} onClick={handleChangeLayout} shape={"circle"} icon={<UnlockOutlined/>}/> </Tooltip> }
        {inChangeLayout && <Tooltip title={"Save Layout"}>
            <Button type={"primary"} onClick={handleSaveLayout} shape={"circle"} icon={<LockOutlined/>}/> </Tooltip> }
    </div>;

    let chartGridList = chartList.map(chart =>
        <div key={chart.id} style={chartGridStyle}>
            <FloatButton.Group
                style={{position: 'absolute', right: '10px', top: '10px'}}
                trigger="hover"
                type="primary"
                icon={<MenuOutlined/>}
            >
                <FloatButton tooltip={"edit chart"} icon={<EditOutlined/>} onClick={() => handleEditChart(chart)}/>
                <Popconfirm placement="leftTop" title={"Are you sure to delete this chart?"}
                            onConfirm={()=> handleDeleteChart(chart)}>
                    <FloatButton tooltip={"delete chart"} icon={<DeleteOutlined/>} onClick={e=> e.stopPropagation()}/>
                </Popconfirm>
            </FloatButton.Group>

            <Chart timeRange={timeRange}  chart={chart}/>
        </div>
    )

    console.log("layout=" + JSON.stringify(layout))

    return (
        <div>
            <Card title={dashboard.name} bordered={false} extra={operateList}>
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