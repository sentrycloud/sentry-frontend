import React, {useEffect, useState} from "react";
import {Button, message, Popconfirm, Select, Space, Tag} from "antd";
import {EditOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import FormModal from "../../components/FormModal";
import {useNavigate, useParams} from "react-router-dom";
import updateListItem from "../../common/utils";
import DashboardDetail from "./DashboardDetail";

const DashboardURL = "/server/api/dashboard"

const dashboardFormOptions = [
    {name: "name", label: "Dashboard Name", message: "please input dashboard name"},
    {name: "creator", label: "Creator Name", message: "please input creator name"},
    {name: "app_name", label: "App Name", message: "please input application name"},
    {name: "chart_layout", label: "Chart Layout", message: "please input chart layout"},
]

function Dashboard() {
    const [open, setOpen] = useState(false)
    const [editDashboard, setEditDashboard] = useState(null)
    const [dashboardList, setDashboardList] = useState([])
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        fetch(DashboardURL)
            .then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    setDashboardList(response['data'])
                } else {
                    let errMsg = "get dashboard list failed: " + response['msg']
                    message.error(errMsg, 3)
                }
            }).catch(reason => {
                let errMsg = "get dashboard list failed: " + reason
                message.error(errMsg, 3)
            })
    }, [])

    function handleChangeDashboard(option){
        navigateDashboard(option.value)
    }

    function onAddDashboard() {
        setOpen(true)
    }

    function onCreateDashboard(record) {
        console.log("create dashboard: " + record)

        fetch(DashboardURL, {
            method: "PUT",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("add dashboard success", 3)
                    record = response['data'] // use response data to update the record
                    setDashboardList(prevDashboardList => [...prevDashboardList, record])
                    navigateDashboard(record.id)
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setOpen(false)
    }

    function onEditDashboard() {
        console.log(`edit dashboard: id=${params.id}`)
        let currentDashboard = getCurrentDashboard()
        setEditDashboard({name: currentDashboard.name, creator: currentDashboard.creator, app_name: currentDashboard.app_name, chart_layout: currentDashboard.chart_layout})
    }

    function onUpdateDashboard(record) {
        console.log("update dashboard: " + record.name + "," + record.creator + ", " + record.app_name + ", " + record.chart_layout)

        record.id = parseInt(params.id)
        fetch(DashboardURL, {
            method: "POST",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("update dashboard success", 3)
                    record = response['data'] // use response data to update the record
                    setDashboardList(prevDashboardList => updateListItem(prevDashboardList, record))
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setEditDashboard(null)
    }

    function onDeleteDashboard() {
        console.log(`delete dashboard: id=${params.id}`)
        let currentDashboard = getCurrentDashboard()
        fetch(DashboardURL, {
            method: "DELETE",
            body: JSON.stringify(currentDashboard)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("delete dashboard success", 3)
                    setDashboardList(prevDashboardList => prevDashboardList.filter(item => item.id !== currentDashboard.id))
                    navigate("/dashboard")
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)
    }

    function getCurrentDashboard() {
        let currentDashboardId = parseInt(params.id)
        console.log("currentDashboardId=" + currentDashboardId)
        let filterDashboard = dashboardList.filter(item => item.id === currentDashboardId)
        return filterDashboard.length > 0 ? filterDashboard[0] : null
    }

    function navigateDashboard(id) {
        console.log("navigate to the /dashboard/" + id)
        navigate(`/dashboard/${id}`)
    }

    if (params.id == null && dashboardList.length > 0) {
        navigateDashboard(dashboardList[0].id)
    }

    let currentDashboard = getCurrentDashboard()
    let defaultLabel = ''
    let options = []
    if (dashboardList != null && dashboardList.length > 0) {
        options = dashboardList.map(item => {
            return {label: item.name, value: item.id}
        })

        if (currentDashboard != null) {
            defaultLabel = currentDashboard.name
        }
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
                        value={defaultLabel}
                        onChange={handleChangeDashboard}
                        optionLabelProp="label"
                        optionFilterProp="label"
                        options={options}
                    />
                </Space>
                <Space direction={"horizontal"} size={"middle"}>
                    <Tag bordered={false}>Dashboard Operation: </Tag>
                    <Button icon={<PlusCircleOutlined/>} type={"primary"} onClick={onAddDashboard}>Add Dashboard</Button>
                    <Button icon={<EditOutlined/>} type={"primary"} onClick={onEditDashboard}>Edit Dashboard</Button>

                    <Popconfirm placement="leftTop" title={"Are you sure to delete this dashboard?"}
                                onConfirm={(e) => onDeleteDashboard()}>
                        <Button icon={<MinusCircleOutlined/>} type={"primary"} danger={true} onClick={e=> e.stopPropagation()}>Delete Dashboard</Button>
                    </Popconfirm>
                </Space>
            </Space>

            {currentDashboard && <DashboardDetail dashboard={currentDashboard} onSaveLayout={onUpdateDashboard}/> }

            <FormModal open={open} title={"Create Dashboard"} onCreate={onCreateDashboard}
                       onCancel={() => {setOpen(false)}} formItems={dashboardFormOptions} />
            {editDashboard && <FormModal open={true} title={"Update Dashboard"} onUpdate={onUpdateDashboard}
                                         onCancel={() => setEditDashboard(null)}
                                         formItems={dashboardFormOptions} record={editDashboard}/>}
        </div>
    );
}

export default Dashboard
