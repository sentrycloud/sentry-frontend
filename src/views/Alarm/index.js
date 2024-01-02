import {Button, message, Popconfirm, Row, Space, Table} from "antd";
import {EditOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import Search from "antd/es/input/Search";
import updateListItem from "../../common/utils";
import AlarmRuleDetail, {getAlarmLevelName, getAlarmTypeName} from "./AlarmRuleDetail";

function Alarm() {
    const [alarmRuleList, setAlarmRuleList] = useState([])
    const [searchedAlarmRuleList, setSearchedAlarmRuleList] = useState([])
    const [openCreate, setOpenCreate] = useState(false);
    const [alarmRule, setAlarmRule] = useState(null)

    useEffect(()=> {
        fetch("/server/api/alarmRule")
            .then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    setAlarmRuleList(response['data'])
                } else {
                    let msg = "get alarm rule list failed " + response['msg']
                    message.error(msg, 3)
                    console.error(msg)
                }
            }).catch(reason => {
                let msg = "get alarm rule list failed " + reason
                message.error(msg, 3)
                console.error(msg)
        })
    }, [])

    function onSearch(value) {
        let searchedAlarmRule = alarmRuleList.filter(rule => {
            return rule.name.includes(value)
        })

        setSearchedAlarmRuleList(searchedAlarmRule)
    }

    function addAlarmRule() {
        setOpenCreate(true)
    }

    function editAlarmRule(record) {
        console.log("update " + record.name)

        record.typeName = getAlarmTypeName(record.type)
        record.levelName = getAlarmLevelName(record.level)
        setAlarmRule(record)
    }

    function deleteAlarmRule(record) {
        console.log("delete alarm rule: " + record.name)
        fetch("/server/api/alarmRule", {
            method: "DELETE",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("delete rule success", 3)
                    setAlarmRuleList(prevAlarmRuleList =>
                        prevAlarmRuleList.filter(rule => rule.id !== record.id)
                    )
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)
    }

    function onCreate(record) {
        console.log('Received values of form: ', record);

        fetch("/server/api/alarmRule", {
            method: "PUT",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("add alarm rule success", 3)
                    record = response['data']
                    setAlarmRuleList(prevAlarmRuleList => [...prevAlarmRuleList, record])
                } else {
                    let errMsg = "add alarm rule failed" + response['msg']
                    console.error(errMsg)
                    message.error(errMsg, 3)
                }
            }).catch(reason => {
                let errMsg = "add alarm rule failed" + reason
                console.error(errMsg)
                message.error(errMsg, 3)
        })

        setOpenCreate(false);
    }

    function onUpdate(record) {
        console.log('Received values of form: ', record);

        record.id = alarmRule.id
        fetch("/server/api/alarmRule", {
            method: "POST",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    message.success("update alarm rule success", 3)
                    setAlarmRuleList(prevAlarmRuleList => updateListItem(prevAlarmRuleList, record))
                } else {
                    let errMsg = "update alarm rule failed" + response['msg']
                    console.error(errMsg)
                    message.error(errMsg, 3)
                }
            }).catch(reason => {
                let errMsg = "update alarm rule failed" + reason
                console.error(errMsg)
                message.error(errMsg, 3)
        })

        setAlarmRule(null);
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Alarm Type',
            dataIndex: 'typeName',
            key: 'typeName',
        },
        {
            title: 'Contacts',
            dataIndex: 'contacts',
            key: 'contacts',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} type={"primary"} onClick={()=> editAlarmRule(record)}>Edit</Button>
                    <Popconfirm placement="leftTop" title={"Are you sure to delete this chart?"}
                                onConfirm={()=> deleteAlarmRule(record)}>
                        <Button icon={<MinusCircleOutlined />} type={"primary"} danger={true}
                                onClick={event => event.stopPropagation()}>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    let displayList = searchedAlarmRuleList.length > 0 ? searchedAlarmRuleList : alarmRuleList
    for (let i = 0; i < displayList.length; i++) {
        displayList[i].typeName = getAlarmTypeName(displayList[i].type)
    }

    return (
        <Space direction={"vertical"} size={"middle"}>
            <Row >
                <Space direction={"horizontal"} size={"middle"}>
                    <Search
                        placeholder="input alarm rule name to search"
                        allowClear
                        enterButton="Search"
                        size={"large"}
                        style={{
                            width: 500,
                        }}
                        onSearch={onSearch}
                    />
                    <Button icon={<PlusCircleOutlined/>} size={"large"} type={"primary"} onClick={addAlarmRule}>Add Alarm Rule</Button>
                </Space>
            </Row>

            <Table columns={columns} dataSource={displayList} pagination={{defaultPageSize:20}}/>

            <AlarmRuleDetail open={openCreate} onCreate={onCreate} onCancel={() => {setOpenCreate(false)}} />
            {alarmRule && <AlarmRuleDetail open={true} onUpdate={onUpdate}
                                           onCancel={() => setAlarmRule(null)} alarmRule={alarmRule}/>}
        </Space>
    )
}

export default Alarm
