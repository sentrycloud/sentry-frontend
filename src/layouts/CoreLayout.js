import {Link, Outlet, useLocation} from "react-router-dom";
import React, {useEffect, useState} from 'react';
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
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: (<Link  to={"/dashboard"}> Dashboards </Link>),
    },
    {
        key: '/chart',
        icon: <LineChartOutlined />,
        label: (<Link  to={"/chart"}> Charts </Link>),
    },
    {
        key: '/metric',
        icon: <CompassOutlined />,
        label: (<Link  to={"/metric"}> Metrics </Link>),
    },
    {
        key: '/contact',
        icon: <ContactsOutlined />,
        label: (<Link  to={"/contact"}> Contacts </Link>),
    },
    {
        key: '/alarm',
        icon: <PhoneOutlined />,
        label: (<Link  to={"/alarm"}> Alarms </Link>),
    }
];

function CoreLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [currentKey, setCurrentKey] = useState("/dashboard")
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    console.log("currentKey=" + currentKey)
    let location = useLocation()
    useEffect(() => {
        if (location.pathname === '/') {
            if (currentKey !==  '/dashboard') {
                setCurrentKey('/dashboard')
            }
        } else {
            if (!location.pathname.startsWith(currentKey)) {
                setCurrentKey(location.pathname)
            }
        }
    }, [location.pathname, currentKey])

    function onClick(e) {
        setCurrentKey(e.key);
    }

    return (
        <Layout>
            <Sider style={{padding: 10}} trigger={null} collapsible collapsed={collapsed}>
                <div className="demo-logo-vertical" />
                <Menu
                    onClick={onClick}
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentKey]}
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
                        minHeight: 360,
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