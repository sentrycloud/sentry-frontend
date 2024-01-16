import {useEffect, useState} from "react";
import {Button, Form, Input, Modal} from "antd";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons";

function TagFilter({open, onUpdate, onCancel, filter}) {
    const [tags, setTags] = useState([...filter.tags])
    const [form] = Form.useForm();

    // I do not know why the useState() do not set tag to initial value, useEffect to set again
    useEffect(()=> {
        setTags([...filter.tags])
    }, [filter.tags])

    function addTag() {
        tags.push("")
        setTags([...tags])
    }

    function handleChangeTag(index, tag) {
        let newTags = [...tags]
        newTags[index] = tag
        setTags(newTags)
    }

    function deleteTag(index) {
        let newTags = tags.filter((tag, i) => i !== index)
        setTags(newTags)
    }

    if (!open) {
        return null
    }

    console.log("tags=" + tags)

    let tagItemList = tags.map((tag, index) => {
        return (
            <div key={index} style={{display:'inline-block'}}>
                <Input style={{ width: 200, textAlign: 'center' }} value={tag} onChange={e=>handleChangeTag(index, e.target.value)} placeholder="tag" />
                &nbsp;&nbsp;
                <Button type="primary" danger={true} size="small" onClick={() => deleteTag(index)}><CloseOutlined/></Button>
                &nbsp;
                { index === tags.length - 1 &&
                    <Button type="primary" size="small" onClick={()=>addTag()}>
                        <PlusOutlined />
                    </Button>
                }
            </div>
        )
    })

    if (tagItemList.length === 0) {
        tagItemList.push(
            <Button type="primary" size="small"  onClick={() => addTag()}>
                <PlusOutlined/>
            </Button>
        )
    }

    return (
        <Modal
            open={open}
            title="Edit Tag Filter"
            okText="OK"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then((values) => {
                        form.resetFields();

                        filter.metric = values.metric
                        filter.tags = tags
                        onUpdate(filter)
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                labelAlign={'left'}
                labelCol={{
                    span: 8,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 600,
                }}
                name={"tag_filter"}
                initialValues={{
                    modifier: 'public',
                }}
            >
                <Form.Item
                    name="metric"
                    label="Metric"
                    initialValue={filter.metric}
                    rules={[
                        {
                            required: true,
                            message: "Please input metric",
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label={'Tags'}
                    rules={[
                        {
                            required: true,
                            message: "Please input tags",
                        },
                    ]}>
                    {tagItemList}
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default TagFilter;
