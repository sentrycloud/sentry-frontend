import {Button, Input} from "antd";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons";

export default function updateListItem(list, newItem) {
    return list.map(item => {
        if (item.id === newItem.id) {
            return {...item, ...newItem}
        } else {
            return item
        }
    })
}

export function transferTags(tags, index, handleAddTag, handleDelTag, handleTagKey, handleTagValue, ){
    let tagsList= [];
    let count= 0;
    if (typeof(tags) === 'string') {
        tags = JSON.parse(tags);
    }

    for (let key in tags) {
        count++;
        tagsList.push(
            <div key={count} className="m-t-5 m-r-5" style={{display:'inline-block'}}>
                <Input style={{ width: 100, textAlign: 'center' }} value={key} onChange={e=>handleTagKey(index, key, e.target.value)} placeholder="key" />
                <Input style={{ width: 24, pointerEvents: 'none', borderLeft: 0 }} placeholder=":" disabled/>
                <Input style={{ width: 180, textAlign: 'center', borderLeft: 0 }} value={tags[key]} onChange={e => handleTagValue(index, key, e.target.value)} placeholder="value" />

                <Button type="primary" danger={true} size="small" onClick={() => handleDelTag(index, key)}><CloseOutlined/></Button>
            </div>
        )
    }

    tagsList.push(
        <Button type="primary" size="small" className="m-l-5" key={count} onClick={()=>handleAddTag(index)}>
            <PlusOutlined />
        </Button>
    )

    return tagsList;
}

