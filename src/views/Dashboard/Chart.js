import React, { useState, useEffect } from 'react';
import {Column, Line, Pie} from '@ant-design/plots';
import {message} from "antd";

function Chart ({timeRange, chart}) {
    const [data, setData] = useState([]);

    useEffect(() => {
        console.log("fetch data for " + chart.name)
        fetch('/server/api/chartData', {
            method: 'POST',
            body: JSON.stringify({start: timeRange.start, end: timeRange.end, ...chart})
        }).then((response) => response.json())
            .then((json) => {
                if (json['code'] === 0) {
                    if (chart.type === 'line') {
                        let dataPoints = []
                        json['data'].forEach(line => {
                                if (line.dps != null && line.dps.length > 0) {
                                    line.dps.map(dataPoint =>
                                        dataPoints.push({...dataPoint, name: line.name})
                                    )
                                }
                            }
                        )
                        setData(dataPoints)
                    } else if (chart.type === 'pie') {
                        let pieData = []
                        json['data'].forEach(line => {
                            if (line.dps != null && line.dps.length > 0) {
                                pieData.push({name: line.name, value: line.dps[line.dps.length - 1].v})
                            }
                        })
                        setData(pieData)
                    } else if (chart.type === 'topN') {
                        setData(json['data'])
                    }
                } else {
                    let errMsg = 'request sentry chart data failed: ' + json['msg']
                    message.error(errMsg)
                    console.log(errMsg)
                }
            })
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    }, [timeRange.end, timeRange.start, chart]);

    console.log("draw chart for " + chart.name)

    function tsToDate(ts) {
        return new Date(ts * 1000).toLocaleString()
    }

    if (chart.type === 'line') {
        const config = {
            data,
            xField: 'ts',
            yField: 'v',
            seriesField: 'name',
            colorField: 'name',
            axis: {
                x: {
                    labelAutoRotate: false,
                    labelFormatter: (val) => tsToDate(val),
                },
            },
            title: chart.name,
            autoFit: true,
            interaction: {
                brushFilter: true
            },
            tooltip: {
                title: {
                    channel: 'x',
                    valueFormatter: (ts) => tsToDate(ts),
                }
            },
            legend: {
                color: {
                    position: 'bottom',
                    layout: {
                        justifyContent: 'center',
                    },
                },
            },
        };

        return <Line {...config} />;
    } else if (chart.type === 'pie') {
        const config = {
            data,
            angleField: 'value',
            colorField: 'name',
            title: chart.name,
            autoFit: true,
            label: {
                text: (d) => `${d.name} ${d.value}`,
                position: 'spider',
            },
            legend: {
                color: {
                    position: 'bottom',
                    layout: {
                        justifyContent: 'center',
                    },
                },
            },
        };

        return <Pie {...config} />;
    } else if (chart.type === 'topN') {
        const config = {
            data,
            xField: 'name',
            yField: 'value',
            axis: {
                x: {
                    labelAutoRotate: false,
                },
            },
            title: chart.name,
            autoFit: true,
            interaction: {
                brushFilter: true
            },
            tooltip: {
                title: {
                    channel: 'x',
                }
            }
        };

        return <Column {...config} />;
    }
}

export default Chart