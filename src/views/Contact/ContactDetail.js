import {Form, Input, Modal } from 'antd';

function ContactDetail({ open, onCreate, onCancel, contact}) {
    const [form] = Form.useForm();

    let title = contact == null ? "Create a new contact" : "Update a contact"
    let okText = contact == null ? "Create" : "Update"
    let contactName = contact == null ? "" : contact.name
    let contactPhone = contact == null ? "" : contact.phone
    let contactMail = contact == null ? "" : contact.mail
    let contactWechat = contact == null ? "" : contact.wechat

    return (
        <Modal
            open={open}
            title={title}
            okText={okText}
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then((values) => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{
                    modifier: 'public',
                }}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    initialValue={contactName}
                    rules={[
                        {
                            required: true,
                            message: 'Please input contact name',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="phone"
                           label="Phone Number"
                           initialValue={contactPhone}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input phone number',
                               },
                           ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="mail"
                           label="Mail Address"
                           initialValue={contactMail}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input mail address',
                               },
                           ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="wechat"
                           label="Wechat ID"
                           initialValue={contactWechat}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input wechat id',
                               },
                           ]}
                >
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ContactDetail;
