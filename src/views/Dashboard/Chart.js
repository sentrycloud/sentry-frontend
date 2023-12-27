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

                    json['data'].map(line => {
                            if (line.dps != null && line.dps.length > 0) {
                                line.dps.map(dataPoint =>
                                    dataPoints.push({...dataPoint, name: line.name})
                                )
                            }
                        }
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

    function tsToDate(ts) {
        return new Date(ts * 1000).toLocaleString()
    }

    const config = {
        data,
        xField: 'ts',
        yField: 'v',
        seriesField: 'name',
        axis: {
            x: {
                labelAutoRotate: false,
                labelFormatter: (val) => tsToDate(val),
            },
        },
        autoFit: true,
        interaction: {
            brushFilter: true
        },
        tooltip: {
            title: {
                channel: 'x',
                valueFormatter: (ts) => tsToDate(ts),
            }
        }
    };

    return <Line {...config} />;
}

export default Chart