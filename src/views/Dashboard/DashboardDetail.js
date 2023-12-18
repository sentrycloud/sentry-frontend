import Chart from "./Chart";
import {Button, Card, DatePicker, Select, TimePicker} from "antd";
import React, {useState} from "react";
import {Responsive, WidthProvider} from "react-grid-layout";
import {autoRefreshOptions, timeSelect} from "./config";

const ResponsiveGridLayout = WidthProvider(Responsive);
const chartGridStyle = {width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}

function DashboardDetail({dashboard}) {
    const [layout, setLayout] = useState([
        {i: 'a', x: 0, y: 0, w: 4, h: 4, static: true},
        {i: 'b', x: 4, y: 0, w: 4, h: 4},
        {i: 'c', x: 8, y: 0, w: 4, h: 4}
    ])

    const [showCustom, setShowCustom] = useState(false)

    function onLayoutChange(newLayout) {
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

    return (
        <Card title={dashboard.name} bordered={false} extra={operateList}>
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
                <div key='a' style={chartGridStyle}> <Chart /> </div>
                <div key='b' style={chartGridStyle}> <Chart /> </div>
                <div key='c' style={chartGridStyle}> <Chart /> </div>
            </ResponsiveGridLayout>
        </Card>
    )
}

export default DashboardDetail;