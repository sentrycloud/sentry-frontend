import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Chart from "./Chart";
import {Button, Card, DatePicker, FloatButton, message, Popconfirm, Row, Select, Tooltip} from "antd";
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
import {generalFetchRequest} from "../../common/request";

const ResponsiveGridLayout = WidthProvider(Responsive);
const chartGridStyle = {overflow:'hidden', width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}
const HeightUnit = 80
const MaxWidthGridNum = 12

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
    const [filterSelectedValue, setFilterSelectedValue] = useState({})
    const [filterOptionList, setFilterOptionList] = useState({})
    const [filterTags, setFilterTags] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        initFilterSelectedValue(dashboard.tag_filter)
        initFilterSelectedOptionList(dashboard.tag_filter)

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
    }, [dashboard.id, dashboard.chart_layout])

    function initFilterSelectedValue(filter) {
        if (filter === '') {
            return
        }

        let filterSelectedValue = {}
        let tagFilter = JSON.parse(filter)
        tagFilter.tags.map(tag => filterSelectedValue[tag] = 'All')
        console.log("init filter tags=" + tagFilter.tags)
        setFilterSelectedValue(filterSelectedValue)
    }

    function initFilterSelectedOptionList(filter) {
        if (filter === '') {
            return
        }

        let filterSelectedOptionList = {}
        let tagFilter = JSON.parse(filter)
        tagFilter.tags.map(tag => filterSelectedOptionList[tag] = [{label:'All', value: 'All'}])
        console.log("init filter options tags=" + tagFilter.tags)
        setFilterOptionList(filterSelectedOptionList)
    }

    // after add chart the router will navigate to initialize dashboard,
    // so we need to add a new layout grid here
    function initLayout(chartList, oldLayout) {
        if (chartList.length === oldLayout.length) {
            setLayout(oldLayout)
        } else {
            // the new chart must the last in the array
            let newChart = chartList[chartList.length - 1]
            let newGrid = {}
            if (oldLayout.length === 0) {
                newGrid = {w: 4, h: 4, x: 0, y: 0, i: newChart.id.toString(), moved:false,static:true}
            } else {
                let lastOldGrid = oldLayout[oldLayout.length - 1]

                if (lastOldGrid.x + lastOldGrid.w + 4 <= MaxWidthGridNum) {
                    // new grid is at the same row with last grid
                    newGrid = {w: 4, h: 4, x: lastOldGrid.x + lastOldGrid.w, y: lastOldGrid.y, i: newChart.id.toString(), moved:false,static:true}
                } else {
                    // new grid is at the next new row to the last grid
                    newGrid = {w: 4, h: 4, x: 0, y: lastOldGrid.y + lastOldGrid.h, i: newChart.id.toString(), moved:false,static:true}
                }

                for (let i = 0; i < oldLayout.length - 1; i++) {
                    let oldGrid = oldLayout[i]
                    if (isRectangleOverlap(oldGrid, newGrid)) {
                        // if overlapped, move below the old grid
                        newGrid.y = oldGrid.y + oldGrid.h
                    }
                }
            }

            let newLayout = [...oldLayout, newGrid]
            dashboard.chart_layout = JSON.stringify(newLayout)
            setLayout(newLayout)
            onUpdateDashboard(dashboard)
        }
    }

    function isRectangleOverlap(rc1, rc2) {
        return rc1.x + rc1.w > rc2.x && rc2.x + rc2.w > rc1.x && rc1.y + rc1.h > rc2.y && rc2.y + rc2.h > rc1.y;
    }

    function onLayoutChange(newLayout, allLayouts) {
        for (let i = 0 ; i < newLayout.length; i++) {
            let item = newLayout[i]
            if (item.w === 1 && item.h === 1) {
                // filter layout change with buggy onLayoutChange
                return
            }
        }

        if (newLayout.length === chartList.length) {
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

    function handleTagFilterChange(tag, tagValue) {
        console.log("handleTagFilterChange, tag=" + tag + ", tagValue=" + tagValue)
        filterSelectedValue[tag] = tagValue
        let newFilterTags = {}
        for (let key in filterSelectedValue) {
            let value = filterSelectedValue[key]
            if (value !== 'All') {
                newFilterTags[key] = value
            }
        }
        setFilterTags(newFilterTags)

        setFilterSelectedValue(prevMap => {
            let newMap = {...prevMap}
            newMap[tag] = tagValue
            return newMap
        })
    }

    function handleTagFilterFocus(m, tag) {
        console.log("handleTagFilterFocus=" + tag)

        let tagsMap = new Map()
        tagsMap[tag] = "*"
        let reqData = {
            method: "POST",
            body: JSON.stringify({metric: m, tags: tagsMap})
        }
        generalFetchRequest("/server/api/tagValues", reqData, function (data) {
            console.log(data)
            setFilterOptionList(prevMap => {
                let newMap = {...prevMap}
                newMap[tag] = [{label:'All', value: 'All'}]
                data.map(tagValue => newMap[tag].push({label:tagValue, value: tagValue}))
                return newMap
            })
        })
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

    let tagFilter = {metric: "", tags: []}
    if (dashboard.tag_filter !== '') {
        tagFilter = JSON.parse(dashboard.tag_filter)
    }

    let tagSelectList = []
    if (tagFilter.tags.length > 0) {
        tagSelectList = tagFilter.tags.map((tag, index) => {
            return (
                <div style={{margin: '5px'}}>
                    <span >{tag}: </span>
                    <Select
                        labelInValue={true}
                        showSearch={true}
                        style={{width:120}}
                        value={filterSelectedValue[tag]}
                        optionLabelProp="label"
                        optionFilterProp="label"
                        onChange={(option) => handleTagFilterChange(tag, option.value)}
                        onFocus={() => handleTagFilterFocus(tagFilter.metric, tag)}
                        options={filterOptionList[tag]}
                    />
                </div>
            )
        })
    }

    let chartGridList = chartList.map(chart =>
        <div key={chart.id} style={chartGridStyle}>
            <FloatButton.Group
                style={{position: 'absolute', right: '10px', top: '10px',width: '40px', height:'40px', border:'0px', margin:'0px', padding: '0px'}}
                trigger="click"
                icon={<MenuOutlined/>}
            >
                <FloatButton tooltip={"edit chart"} icon={<EditOutlined/>} onClick={() => handleEditChart(chart)}/>
                <Popconfirm placement="leftTop" title={"Are you sure to delete this chart?"}
                            onConfirm={()=> handleDeleteChart(chart)}>
                    <FloatButton tooltip={"delete chart"} icon={<DeleteOutlined/>} onClick={e=> e.stopPropagation()}/>
                </Popconfirm>
            </FloatButton.Group>

            <Chart timeRange={timeRange}  chart={chart} tagFilter={filterTags}/>
        </div>
    )

    return (
        <div>
            <Card title={dashboard.name} bordered={false} extra={operateList}>
                {tagSelectList.length > 0 ? <Row> {tagSelectList} </Row> : null}
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