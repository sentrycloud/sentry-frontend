import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import {message} from "antd";

function Chart ({chart}) {
    const [data, setData] = useState([]);

    useEffect(() => {
        console.log("fetch data for " + chart.name)
        asyncFetch();
    }, []);

    const asyncFetch = () => {
        fetch('/server/api/chartData', {
            method: 'POST',
            body: JSON.stringify({chart_id: chart.id})
        }).then((response) => response.json())
            .then((json) => {
                if (json['code'] === 0) {
                    let dataPoints = []

                    json['data'].map(line =>
                        line.dps.map(dataPoint =>
                            dataPoints.push({...dataPoint, name: line.name})
                        )
                    )
                    setData(dataPoints)
                } else {
                    let errMsg = 'request sentry chart data failed: ' + json['msg']
                    message.error(errMsg)
                    console.log(errMsg)
                }
            })
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    };

    console.log("draw line for " + chart.name)

    const config = {
        data,
        xField: 'ts',
        yField: 'v',
        seriesField: 'name',
        axis: {
            x: {
                labelFormatter: (val) => new Date(val * 1000).toLocaleString(),
            },
        },
        autoFit: true,
        title: chart.name
    };

    return <Line {...config} />;
}

export default Chart