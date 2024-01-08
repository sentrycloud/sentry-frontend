import {Form, Input, Modal} from "antd";

function FormModal({open, title, onCreate, onUpdate, onCancel, formItems, record}) {
    const [form] = Form.useForm();

    if (!open) {
        return null
    }

    let okText = record == null ? "Create" : "Update"
    let formItemList = formItems.map((item, index) => {
        const {name, label, message, disable} = item

        let disableFlag = disable !== null ? disable : false
        return (
            <Form.Item
                key={index}
                name={name}
                label={label}
                initialValue={record == null ? "" : record[name]}
                rules={[
                    {
                        required: !disableFlag,
                        message: {message},
                    },
                ]}
            >
                <Input disabled={disableFlag}/>
            </Form.Item>
        )
    })

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
                        if (onCreate != null) {
                            onCreate(values);
                        }
                        if (onUpdate != null) {
                            onUpdate(values)
                        }
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name={"form_in_modal" + okText}
                initialValues={{
                    modifier: 'public',
                }}
            >
                {formItemList}
            </Form>
        </Modal>
    );
}

export default FormModal;