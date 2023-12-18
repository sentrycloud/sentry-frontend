import React, {useEffect, useState} from 'react';
import {Button, message, Row, Space, Table} from 'antd';
import Search from "antd/es/input/Search";
import {EditOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import MetricDetail from "./MetricDetail";
import updateListItem from "../../common/utils";

function Metric() {
    const [metricWhiteList, setMetricWhiteList] = useState([])
    const [searchedMetricWhiteList, setSearchedMetricWhiteList] = useState([])
    const [openCreate, setOpenCreate] = useState(false);
    const [metric, setMetric] = useState(null)

    useEffect(()=> {
        fetch("/server/api/metricWhiteList")
            .then(response => response.json())
            .then(response => setMetricWhiteList(response['data']))
            .catch(console.error)
    }, [])

    function onSearch(value) {
        console.log("search " + value)
        let searchedWhiteList = metricWhiteList.filter(item => {
            return item.metric.includes(value)
        })
        setSearchedMetricWhiteList(searchedWhiteList)
    }

    function addMetric() {
        console.log("addMetric")
        setOpenCreate(true)
    }

    function onCreate(record) {
        console.log('Received values of form: ', record);

        fetch("/server/api/metricWhiteList", {
            method: "PUT",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    record = response['data'] // use response data to update the record
                    setMetricWhiteList(prevWhiteList => [...prevWhiteList, record])
                    message.success("add metric white list success", 3)
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setOpenCreate(false);
    }

    function editMetric(record) {
        console.log("update metric: " + record.metric)
        setMetric(record)
    }

    function onUpdate(record) {
        console.log('Received values of form: ', record);

        record.id = metric.id
        fetch("/server/api/metricWhiteList", {
            method: "POST",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("update metric success", 3)
                    setMetricWhiteList(prevWhiteList => updateListItem(prevWhiteList, record))
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setMetric(null);
    }

    function deleteMetric(record) {
        console.log("delete " + record.metric)
        console.log("delete metric: " + record.metric)
        fetch("/server/api/metricWhiteList", {
            method: "DELETE",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("delete metric success", 3)
                    setMetricWhiteList(prevWhiteList =>
                        prevWhiteList.filter(item => item.id !== record.id)
                    )
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)
    }

    const columns = [
        {
            title: 'Metric Name',
            dataIndex: 'metric',
            key: 'metric',
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            key: 'creator',
        },
        {
            title: 'AppName',
            dataIndex: 'app_name',
            key: 'app_name',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined/>} type={"primary"} onClick={() => editMetric(record)}>Edit</Button>
                    <Button icon={<MinusCircleOutlined />} type={"primary"} onClick={()=> deleteMetric(record)}>Delete</Button>
                </Space>
            ),
        },
    ];

    let displayList = searchedMetricWhiteList.length === 0 ? metricWhiteList : searchedMetricWhiteList

    return (
        <Space direction={"vertical"} size={"middle"}>
            <Row >
                <Space direction={"horizontal"} size={"middle"}>
                <Search
                    placeholder="input search metric"
                    allowClear
                    enterButton="Search"
                    size={"large"}
                    style={{
                        width: 500,
                    }}
                    onSearch={onSearch}
                />

                <Button icon={<PlusCircleOutlined/>} size={"large"} type={"primary"} onClick={addMetric}>Add Metric</Button>
                </Space>
            </Row>
            <Table columns={columns} dataSource={displayList} pagination={{defaultPageSize:20}}/>

            <MetricDetail open={openCreate} onCreate={onCreate} onCancel={() => setOpenCreate(false)} metric={null}/>
            {metric && <MetricDetail open={true} onCreate={onUpdate} onCancel={() => setMetric(null)} metric={metric}/>}
        </Space>
    )
}

export default Metric
