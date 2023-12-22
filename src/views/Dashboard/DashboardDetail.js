import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Chart from "./Chart";
import {Button, Card, DatePicker, message, Select, Space} from "antd";
import React, {useEffect, useState} from "react";
import {Responsive, WidthProvider} from "react-grid-layout";
import {autoRefreshOptions, timeSelect} from "./config";
import {LineChartOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const ResponsiveGridLayout = WidthProvider(Responsive);
const chartGridStyle = {width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}

function DashboardDetail({dashboard}) {
    const [layout, setLayout] = useState([])

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
        console.log(option.title)

        if (option.value === "custom") {
            setShowCustom(true)
        }
    }

    function handleCustom(value) {

    }

    function handleAutoRefresh(value) {
        console.log(value.title)
    }

    function handleRefresh() {
        console.log("refresh")
    }

    function handleAddChart() {
        console.log(`add chart for ${dashboard.name}`)
        navigate(`/dashboard/${dashboard.id}/chart/create`)
    }

    function handleChangeLayout() {
        console.log(`handle change layout for ${dashboard.name}`)
    }

    let operateList= <div>
        <span>Time: </span>
        <Select labelInValue={true}
                style={{width:150}}
                value={"Last 1h"}
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
                value={''}
                optionLabelProp="label"
                optionFilterProp="label"
                onChange={handleAutoRefresh}
                options={autoRefreshOptions}
        />
        &nbsp;&nbsp;
        <Button type={"primary"} onClick={handleRefresh} >Refresh</Button>
    </div>;

    let chartGridList = chartList.map(chart =>
        <div key={chart.id} style={chartGridStyle}> <Chart chart={chart}/> </div>
    )

    console.log("layout=" + JSON.stringify(layout))

    return (
        <div>
            <Card title={dashboard.name} bordered={false} extra={operateList}>
                <Space direction={"horizontal"} size={"middle"}>
                    <Button icon={<LineChartOutlined/>} type={"primary"} onClick={handleAddChart}>Add Chart</Button>
                    <Button type={"primary"} onClick={handleChangeLayout} >Change Layout</Button>
                </Space>
                &nbsp;&nbsp;

                <ResponsiveGridLayout
                    className="layout"
                    layouts={{"lg":layout}}
                    preventCollision={true}
                    autoSize={true}
                    rowHeight={80}
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