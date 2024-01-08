import {Card, Form, Input, InputNumber, Modal, Select} from 'antd';
import {useState} from "react";
import {aggregationTypeOptions} from "../Dashboard/config";
import TextArea from "antd/es/input/TextArea";
import {transferTags} from "../../common/utils";

const alarmTypeOptions = [
    {label:'heartbeat', value: 0},
    {label:'threshold', value: 1},
    {label:'topN', value: 2},
    {label:'compare', value: 3},
]

const alarmLevelOptions = [
    {label:'info', value: 0},
    {label:'warn', value: 1},
    {label:'error', value: 2},
]

const sortOptions = [
    {label:'desc', value: 'desc'},
    {label:'asc', value: 'asc'},
]

const compareOptions = [
    {label:'difference', value: 0},
    {label:'ratio', value: 1},
]

export function getAlarmTypeName(type) {
    if (type === 0) {
       return "heartbeat"
    } else if (type === 1) {
        return "threshold"
    } else if (type === 2) {
        return "topN"
    } else if (type === 3) {
        return "compare"
    } else {
        return 'unknown'
    }
}

export function getAlarmLevelName(level) {
    if (level === 0) {
        return 'info'
    } else if (level === 1) {
        return 'warn'
    } else if (level === 2) {
        return 'error'
    } else {
        return 'unknown'
    }
}

function getCompareTypeName(compareType) {
    if (compareType === 0) {
        return "difference"
    } else if (compareType === 1) {
        return "ratio"
    } else {
        return "unknown"
    }
}

function AlarmRuleDetail({open, onCreate, onUpdate, onCancel, alarmRule}) {
    const [alarmTypeOption, setAlarmTypeOption] = useState(
        alarmRule == null ? {label:'heartbeat', value: 0} : {label:alarmRule.typeName, value: alarmRule.type})
    const [dataSource, setDataSource] = useState(
        alarmRule == null ? {metric:'', tags: {}, aggregation: "sum", down_sample: 10, sort: "desc", limit: 20,
                                        compare_type: 0, compare_days_ago: 1, compare_seconds: 0}
            : JSON.parse(alarmRule.data_source))
    const [alarmLevelOption, setAlarmLevelOption] = useState(
        alarmRule == null ? {label:'info', value: 0}: {label:alarmRule.alarmLevelName, value: alarmRule.level}
    )
    const [form] = Form.useForm();

    function onAlarmTypeChange(option) {
        console.log("onAlarmTypeChange: " + option)
        setAlarmTypeOption(option)
    }

    function onAggregationTypeChange(option) {
        console.log("onAggregationTypeChange: " + option)

        let newDataSource = {...dataSource}
        newDataSource.aggregation = option.value
        setDataSource(newDataSource)
    }

    function onSortByChange(option) {
        console.log("onSortByChange: " + option)

        let newDataSource = {...dataSource}
        newDataSource.sort = option.value
        setDataSource(newDataSource)
    }

    function onCompareTypeChange(option) {
        console.log("onCompareTypeChange: " + option)

        let newDataSource = {...dataSource}
        newDataSource.compare_type = option.value
        setDataSource(newDataSource)
    }

    function onAlarmLevelChange(option) {
        setAlarmLevelOption(option)
    }

    function handleTagKey(index, oldKey, newKey) {
        console.log(`handleTagKey: old=${oldKey}, new=${newKey}`)

        let newDataSource = {...dataSource}
        newDataSource.tags[newKey] = newDataSource.tags[oldKey]
        delete newDataSource.tags[oldKey]
        setDataSource(newDataSource)
    }

    function handleTagValue(index, key, value) {
        console.log(`handleTagValue: key=${key}, value=${value}`)

        let newDataSource = {...dataSource}
        newDataSource.tags[key] = value
        setDataSource(newDataSource)
    }

    function handleAddTag(index) {
        console.log('handleAddTag')
        if ('' in dataSource.tags) {
            console.log("has empty tag already")
            return
        }

        let newDataSource = {...dataSource}
        newDataSource.tags[''] = ''
        setDataSource(newDataSource)
    }

    function handleDelTag(index, key) {
        console.log(`handleDelTag, key=${key}`)

        let newDataSource = {...dataSource}
        delete newDataSource.tags[key]
        setDataSource(newDataSource)
    }

    if (!open) {
        return
    }

    let title = alarmRule == null ? "Create Alarm Rule" : "Update Alarm Rule"
    let okText = alarmRule == null ? "Create" : "Update"
    let trigger = alarmRule == null ? {less_than: '', greater_than: '', error_count: 1} : JSON.parse(alarmRule.trigger)

    return (
        <Modal
            width={600}
            open={open}
            title={title}
            okText={okText}
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields()
                    .then((values) => {
                        form.resetFields();

                        let newAlarmRule = {}
                        if (alarmRule != null) {
                            newAlarmRule.id = alarmRule.id
                        }
                        newAlarmRule.name = values.name
                        newAlarmRule.type = alarmTypeOption.value
                        newAlarmRule.query_range = values.query_range
                        newAlarmRule.contacts = values.contacts
                        newAlarmRule.level = alarmLevelOption.value
                        newAlarmRule.message = values.message

                        let newDataSource = {}
                        newDataSource.metric = values.metric
                        newDataSource.tags = dataSource.tags
                        newDataSource.aggregation = dataSource.aggregation
                        newDataSource.down_sample = values.down_sample
                        if (alarmTypeOption.label === 'topN') {
                            newDataSource.sort = dataSource.sort
                            newDataSource.limit = values.limit
                        }
                        if (alarmTypeOption.label === 'compare') {
                            newDataSource.compare_type = dataSource.compare_type
                            newDataSource.compare_days_ago = dataSource.compare_days_ago
                            newDataSource.compare_seconds = dataSource.compare_seconds
                        }
                        newAlarmRule.data_source = JSON.stringify(newDataSource)

                        let trigger = {}
                        if (alarmTypeOption.label === 'heartbeat') {
                            trigger = {error_count: values.error_count}
                        } else {
                            trigger = {
                                less_than: values.less_than,
                                greater_than: values.greater_than,
                                error_count: values.error_count,
                            }
                        }
                        newAlarmRule.trigger = JSON.stringify(trigger)

                        if (alarmRule == null) {
                            onCreate(newAlarmRule)
                        } else {
                            onUpdate(newAlarmRule)
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
                name="form_in_modal"
                initialValues={{
                    modifier: 'public',
                }}
            >
                <Form.Item
                    name="name"
                    label="Name"
                    tooltip={'name of this alarm rule'}
                    initialValue={alarmRule == null ? "" : alarmRule.name}
                    rules={[
                        {
                            required: true,
                            message: 'Please input alarm rule name',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="type"
                           label="Alarm Type"
                           initialValue={alarmTypeOption}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input alarm option',
                               },
                           ]}
                >
                    <Select  labelInValue={true}
                             style={{display:"block"}}
                             options={alarmTypeOptions}
                             onChange={onAlarmTypeChange}
                    />
                </Form.Item>

                <Form.Item name="query_range"
                           label="Query Time Range"
                           initialValue={alarmRule == null ? 60 : alarmRule.query_range}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input query time range',
                               },
                           ]}
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item name="contacts"
                           label="Contacts"
                           tooltip={"contact names, use , to separate multiple contacts"}
                           initialValue={alarmRule == null ? "": alarmRule.contacts}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input contact, use , as separator for multiple contacts',
                               },
                           ]}
                >
                    <Input/>
                </Form.Item>

                <Card title={'Data Source Setup'} bordered={false}>
                    <Form.Item name="metric"
                               label="Metric"
                               initialValue={dataSource.metric}
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input metric name',
                                   },
                               ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label='Tags'
                    >
                        {transferTags(dataSource.tags, 0, handleAddTag, handleDelTag, handleTagKey, handleTagValue)}
                    </Form.Item>

                    <Form.Item name="aggregation"
                               label="Aggregation Type"
                               initialValue={{label: dataSource.aggregation, value: dataSource.aggregation}}
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input aggregation type',
                                   },
                               ]}
                    >
                        <Select  labelInValue={true}
                                 style={{display:"block"}}
                                 options={aggregationTypeOptions}
                                 onChange={onAggregationTypeChange}
                        />
                    </Form.Item>

                    <Form.Item name="down_sample"
                               label="Dowm Sample"
                               tooltip={'unit: second'}
                               initialValue={dataSource.down_sample}
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input down sample time',
                                   },
                               ]}
                    >
                        <InputNumber />
                    </Form.Item>

                    {alarmTypeOption.label === 'topN' &&
                        <Form.Item name="sort"
                                   label="Sort by"
                                   initialValue={{label: dataSource.sort, value: dataSource.sort}}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input sort type',
                                       },
                                   ]}
                        >
                            <Select  labelInValue={true}
                                     style={{display:"block"}}
                                     options={sortOptions}
                                     onChange={onSortByChange}
                            />
                        </Form.Item>
                    }
                    {alarmTypeOption.label === 'topN' &&
                        <Form.Item name="limit"
                                   label="Limit"
                                   tooltip={'limit the topN count'}
                                   initialValue={dataSource.limit}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input limit count',
                                       },
                                   ]}
                        >
                            <InputNumber />
                        </Form.Item>
                    }
                    {alarmTypeOption.label === 'compare' &&
                        <Form.Item name="compare_type"
                                   label="Compare Type Difference or Ratio"
                                   initialValue={{label: getCompareTypeName(dataSource.compare_type), value: dataSource.compare_type}}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input compare type',
                                       },
                                   ]}
                        >
                            <Select  labelInValue={true}
                                     style={{display:"block"}}
                                     options={compareOptions}
                                     onChange={onCompareTypeChange}
                            />
                        </Form.Item>
                    }
                    {alarmTypeOption.label === 'compare' &&
                        <Form.Item name="compare_days_ago"
                                   label="Compare Days Ago"
                                   tooltip={'compare current data with data of this days ago'}
                                   initialValue={dataSource.compare_days_ago}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input compare days ago',
                                       },
                                   ]}
                        >
                            <InputNumber />
                        </Form.Item>
                    }
                    {alarmTypeOption.label === 'compare' &&
                        <Form.Item name="compare_seconds"
                                   label="Compare Seconds"
                                   tooltip={'compare current data with data of this seconds ago'}
                                   initialValue={dataSource.compare_seconds}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please input compare seconds',
                                       },
                                   ]}
                        >
                            <InputNumber />
                        </Form.Item>
                    }
                </Card>

                <Card title={'Alarm Trigger Setup'} bordered={false}>
                    { alarmTypeOption.label !== 'heartbeat' &&
                        <Form.Item name="less_than"
                           label="Less Than"
                           initialValue={trigger.less_than}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input less than value',
                               },
                           ]}
                    >
                        <InputNumber />
                    </Form.Item>}

                    { alarmTypeOption.label !== 'heartbeat' &&
                        <Form.Item name="greater_than"
                          label="Greater Than"
                          initialValue={trigger.greater_than}
                          rules={[
                              {
                                  required: true,
                                  message: 'Please input greater than value',
                              },
                          ]}
                    >
                        <InputNumber />
                    </Form.Item>}

                    <Form.Item name="error_count"
                               label="Error Count"
                               tooltip={"trigger alarm when error count reach this value"}
                               initialValue={trigger.error_count}
                               rules={[
                                   {
                                       required: true,
                                       message: 'Please input error count',
                                   },
                               ]}
                    >
                        <InputNumber />
                    </Form.Item>
                </Card>

                <Form.Item name="level"
                           label="Alarm Level"
                           initialValue={alarmLevelOption}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input alarm option',
                               },
                           ]}
                >
                    <Select  labelInValue={true}
                             style={{display:"block"}}
                             options={alarmLevelOptions}
                             onChange={onAlarmLevelChange}
                    />
                </Form.Item>

                <Form.Item name="message"
                           label="Alarm Message"
                           initialValue={alarmRule == null ? '': alarmRule.message}
                           rules={[
                               {
                                   required: true,
                                   message: 'Please input alarm message',
                               },
                           ]}
                >
                    <TextArea rows={3}/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default AlarmRuleDetail;