import React, {useEffect, useState} from 'react';
import {Button, Row, Space, Table} from 'antd';
import Search from "antd/es/input/Search";
import {EditOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import ContactDetail from "./ContactDetail";

function Contact() {
    const [contactList, setContactList] = useState([])
    const [searchedContactList, setSearchedContactList] = useState([])
    const [openCreate, setOpenCreate] = useState(false);
    const [contact, setContact] = useState(null)

    useEffect(()=> {
        fetch("/server/api/contact")
            .then(response => response.json())
            .then(response => setContactList(response['data']))
            .catch(console.error)
    }, [])

    function onSearch(value) {
        console.log(value)
        let searchedContacts = contactList.filter(contact => {
            return contact.name.includes(value)
        })

        setSearchedContactList(searchedContacts)
    }

    function addContact() {
        console.log("addContact")
        setOpenCreate(true)
    }

    function editContact(record) {
        console.log("update " + record.name)
        setContact(record)
    }

    function deleteContact(record) {
        console.log("delete contact: " + record.name)
        fetch("/server/api/contact", {
            method: "DELETE",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    setContactList(prevContactList =>
                        prevContactList.filter(contact => contact.id !== record.id)
                    )
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)
    }

    function onCreate(record) {
        console.log('Received values of form: ', record);

        fetch("/server/api/contact", {
            method: "PUT",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    record = response['data']
                    setContactList(prevContactList => [...prevContactList, record])
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setOpenCreate(false);
    }

    function onUpdate(record) {
        console.log('Received values of form: ', record);

        record.id = contact.id
        fetch("/server/api/contact", {
            method: "POST",
            body: JSON.stringify(record)
        }).then(response => response.json())
            .then(response => {
                if (response['code'] === 0) {
                    setContactList(prevContactList =>
                        prevContactList.map(item => {
                                if (item.id === contact.id) {
                                    return {...item, ...record}
                                } else {
                                    return item
                                }
                            })
                    )
                } else {
                    console.error(response['msg'])
                }
            }).catch(console.error)

        setContact(null);
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Mail Address',
            dataIndex: 'mail',
            key: 'mail',
        },
        {
            title: 'Wechat ID',
            dataIndex: 'wechat',
            key: 'wechat',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} type={"primary"} onClick={()=> editContact(record)}>Edit</Button>
                    <Button icon={<MinusCircleOutlined />} type={"primary"} onClick={()=> deleteContact(record)}>Delete</Button>
                </Space>
            ),
        },
    ];

    let displayList = searchedContactList.length > 0 ? searchedContactList : contactList

    return (
        <Space direction={"vertical"} size={"middle"}>
            <Row >
                <Space direction={"horizontal"} size={"middle"}>
                    <Search
                        placeholder="input search contact name"
                        allowClear
                        enterButton="Search"
                        size={"large"}
                        style={{
                            width: 500,
                        }}
                        onSearch={onSearch}
                    />
                    <Button icon={<PlusCircleOutlined/>} size={"large"} type={"primary"} onClick={addContact}>Add Contact</Button>
                </Space>
            </Row>
            <Table columns={columns} dataSource={displayList} pagination={{defaultPageSize:20}}/>

            <ContactDetail open={openCreate} onCreate={onCreate} onCancel={() => setOpenCreate(false)} contact={null}/>
            {contact != null ? <ContactDetail open={true} onCreate={onUpdate} onCancel={() => setContact(null)} contact={contact}/> : null}
        </Space>
    )
}

export default Contact
