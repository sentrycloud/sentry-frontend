
export default function updateListItem(list, newItem) {
    return list.map(item => {
        if (item.id === newItem.id) {
            return {...item, ...newItem}
        } else {
            return item
        }
    })
}

