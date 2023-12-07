import React from 'react';
import {Button, Row, Space, Table} from 'antd';
import Search from "antd/es/input/Search";
import {MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";

function deleteItem(record) {
    console.log("delete " + record.name)
}

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Creator',
        dataIndex: 'creator',
        key: 'creator',
    },
    {
        title: 'AppName',
        dataIndex: 'appName',
        key: 'appName',
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button icon={<MinusCircleOutlined />} type={"primary"} onClick={()=> deleteItem(record)}>Delete</Button>
            </Space>
        ),
    },
];

let data = [];
for (let i = 0; i < 100; i++) {
     data.push(
        {
            key: i,
            name: `Metric${i}`,
            creator: `user${i}`,
            appName: `appName${i}`,
        });
}

function Metric() {
    function onSearch(value) {
        console.log(value)
    }

    function addMetric() {
        console.log("addMetric")
    }

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
                <Button icon={<PlusCircleOutlined/>} size={"large"} type={"primary"} onClick={addMetric}>Add Metric </Button>
                </Space>
            </Row>
            <Table columns={columns} dataSource={data} pagination={{defaultPageSize:20}}/>
        </Space>
    )
}

export default Metric
