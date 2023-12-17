import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Chart from "./Chart";
import React, {useEffect, useState} from "react";
import {Button, Card, message, Select, Space, Tag} from "antd";
import {EditOutlined, LineChartOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import FormModal from "../../components/FormModal";
import {useNavigate, useParams} from "react-router-dom";
const ResponsiveGridLayout = WidthProvider(Responsive);

const dashboardFormOptions = [
    {name: "name", label: "Dashboard Name", message: "please input dashboard name"},
    {name: "creator", label: "Creator Name", message: "please input creator name"},
    {name: "app_name", label: "App Name", message: "please input application name"},
    {name: "chart_layout", label: "Chart Layout", message: "please input chart layout"},
]

function Dashboard() {
    const [layout, setLayout] = useState(
        {"lg":[
                    {i: 'a', x: 0, y: 0, w: 4, h: 4, static: true},
                    {i: 'b', x: 4, y: 0, w: 4, h: 4},
                    {i: 'c', x: 8, y: 0, w: 4, h: 4}
                ]})
    const [open, setOpen] = useState(false)
    const [editDashboard, setEditDashboard] = useState(null)
    const [dashboardList, setDashboardList] = useState([])
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        fetch("/server/api/dashboard")
            .then(response => response.json())
            .then(response => setDashboardList(response['data']))
            .catch(console.error)
    }, [])

    console.log("params=" + params)
    if (params.id == null && dashboardList.length > 0) {
        console.log("navigate to the first dashboard")
        navigate("/dashboard/" + dashboardList[0].id)
    }

    function onLayoutChange(newLayout) {
        setLayout({"lg": newLayout})
    }

    console.log(layout)
    const gridStyle = {width:'100%',height:'100%', border: '2px solid rgba(0, 0, 0, 0.05)'}

    const handleChange = (value) => {
        console.log(`selected ${value.label} ${value.value}`);
    };

    function onAddDashboard() {
        setOpen(true)
    }

    function onCreateDashboard(record) {
        console.log("create dashboard: " + record)

        fetch("/server/api/dashboard", {
            method: "PUT",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    record = response['data'] // use response data to update the record
                    setDashboardList(prevDashboardList => [...prevDashboardList, record])
                    message.success("add dashboard success", 3)
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setOpen(false)
    }

    function onEditDashboard() {
        setEditDashboard({name:"machine monitor", creator:"adu", app_name: "sentry", chart_layout:"[]"})
    }

    function onUpdateDashboard(record) {
        console.log("update dashboard: " + record.name + "," + record.creator + ", " + record.app_name + ", " + record.chart_layout)
        setEditDashboard(null)
    }

    let options = []
    if (dashboardList != null && dashboardList.length > 0) {
        options = dashboardList.map(item => {
            return {label: item.name, value: item.id}
        })
    }

    return (
        <div>
            <Space direction={"vertical"} size={"middle"}>
                <Space direction={"horizontal"} size={"middle"}>
                    <Tag bordered={false}>Dashboard List: </Tag>
                    <Select
                        style={{width: '600px'}}
                        labelInValue={true}
                        showSearch={true}
                        placeholder="select one dashboard"
                        defaultValue={['']}
                        onChange={handleChange}
                        optionLabelProp="label"
                        optionFilterProp="label"
                        options={options}
                    />
                </Space>
                <Space direction={"horizontal"} size={"middle"}>
                    <Tag bordered={false}>Dashboard Operation: </Tag>
                    <Button icon={<PlusCircleOutlined/>} type={"primary"} onClick={onAddDashboard}>Add Dashboard</Button>
                    <Button icon={<EditOutlined/>} type={"primary"} onClick={onEditDashboard}>Edit Dashboard</Button>
                    <Button icon={<MinusCircleOutlined/>} type={"primary"}>Delete Dashboard</Button>
                    <Button icon={<LineChartOutlined/>} type={"primary"}>Add Chart</Button>
                </Space>

            </Space>
            <Card title={"DashboardName"} bordered={false}>
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layout}
                    preventCollision={true}
                    autoSize={true}
                    rowHeight={80}
                    breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                    onLayoutChange={onLayoutChange}
                >
                    <div key='a' style={gridStyle}> <Chart /> </div>
                    <div key='b' style={gridStyle}> <Chart /> </div>
                    <div key='c' style={gridStyle}> <Chart /> </div>
                </ResponsiveGridLayout>
            </Card>
            <FormModal open={open} title={"Create Dashboard"} onCreate={onCreateDashboard}
                       onCancel={() => {setOpen(false)}} formItems={dashboardFormOptions} />
            {editDashboard && <FormModal open={true} title={"Update Dashboard"} onUpdate={onUpdateDashboard}
                                         onCancel={() => setEditDashboard(null)}
                                         formItems={dashboardFormOptions} record={editDashboard}/>}
        </div>
    );
}

export default Dashboard
