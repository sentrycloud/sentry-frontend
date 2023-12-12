import {Form, Input, Modal } from 'antd';

function MetricDetail({ open, onCreate, onCancel, metric}) {
    const [form] = Form.useForm();

    let title = metric == null ? "Create a new metric" : "Update a metric"
    let okText = metric == null ? "Create" : "Update"
    let metricName = metric == null ? "" : metric.metric
    let creator = metric == null ? "" : metric.creator
    let app_name = metric == null ? "" : metric.app_name

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
                    name="metric"
                    label="Metric Name"
                    initialValue={metricName}
                    rules={[
                        {
                            required: true,
                            message: 'Please input metric name',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="creator"
                           label="Creator"
                           initialValue={creator}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input creator name',
                               },
                           ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="app_name"
                           label="appName"
                           initialValue={app_name}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input appName that owns the metric',
                               },
                           ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default MetricDetail;
