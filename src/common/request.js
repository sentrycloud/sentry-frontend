import {message} from "antd";
import updateListItem from "./utils";

export function fetchRequest(url, reqData, updateHookFunc, postProcessFunc = null) {
    fetch(url, reqData)
        .then(response => response.json())
        .then(response => {
            if (response['code'] === 0) {
                let data = response['data']
                if (data != null) {
                    if (reqData == null) {
                        updateHookFunc(data) // GET request
                    } else {
                        if (reqData.method === 'PUT') {
                            updateHookFunc(prevDataList => [...prevDataList, data])
                        } else if (reqData.method === 'POST') {
                            updateHookFunc(prevDataList => updateListItem(prevDataList, data))
                        } else if (reqData.method === 'DELETE') {
                            updateHookFunc(prevDataList =>
                                prevDataList.filter(item => item.id !== data.id)
                            )
                        } else {
                            console.error("no such method: " + reqData.method)
                        }
                    }

                    if (postProcessFunc != null) {
                        postProcessFunc(data)
                    }
                }
            } else {
                let msg = url + " failed: " + response['msg']
                message.error(msg, 3)
                console.error(msg)
            }
        }).catch(reason => {
            let msg =  url + " failed: " + reason
            message.error(msg, 3)
            console.error(msg)
        })
}

export function generalFetchRequest(url, reqData, successProcessFunc) {
    fetch(url, reqData)
        .then(response => response.json())
        .then(response => {
            if (response['code'] === 0) {
                let data = response['data']
                if (data != null) {
                    successProcessFunc(data)
                }
            } else {
                let msg = url + " failed: " + response['msg']
                message.error(msg, 3)
                console.error(msg)
            }
        }).catch(reason => {
            let msg =  url + " failed: " + reason
            message.error(msg, 3)
            console.error(msg)
        })
}