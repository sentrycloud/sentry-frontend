import {Link, Outlet} from "react-router-dom";
import React, { useState } from 'react';
import {
    CompassOutlined,
    ContactsOutlined,
    DashboardOutlined, LineChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const menuItems = [
    {
        key: '1',
        icon: <DashboardOutlined />,
        label: (<Link  to={"/dashboard"}> Dashboards </Link>),
    },
    {
        key: '2',
        icon: <LineChartOutlined />,
        label: (<Link  to={"/chart"}> Charts </Link>),
    },
    {
        key: '3',
        icon: <CompassOutlined />,
        label: (<Link  to={"/metric"}> Metrics </Link>),
    },
    {
        key: '4',
        icon: <ContactsOutlined />,
        label: (<Link  to={"/contact"}> Contacts </Link>),
    },
    {
        key: '5',
        icon: <PhoneOutlined />,
        label: (<Link  to={"/alarm"}> Alarms </Link>),
    }
];

function CoreLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout>
            <Sider style={{padding: 10}} trigger={null} collapsible collapsed={collapsed}>
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                    }}
                >

                {/* render child route elements: https://reactrouter.com/en/main/components/outlet */}
                <Outlet />

                </Content>
            </Layout>
        </Layout>
    );
}

export default CoreLayout