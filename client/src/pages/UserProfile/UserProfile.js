import React, {useState, useEffect} from 'react';
import 'antd/dist/antd.css';
import { Layout, Menu } from 'antd';
import { CustomerServiceOutlined, HeartOutlined, CloudDownloadOutlined, TeamOutlined} from '@ant-design/icons';
import ProfileCard from './ProfileCard';
import EditProfileForm from './EditProfileForm';


const { Header, Content, Sider } = Layout;

const sidebarItems = [
  {
    key: "Recommend", 
    label: "Recommend",
    children: 
      [
        {
          icon: React.createElement(CustomerServiceOutlined),
          key: "Find Music", 
          label: "Find Music"
        }, 
        {
          icon: React.createElement(TeamOutlined),
          key: "Friends", 
          label: "Friends"
        }

      ]
  }, 

  {
    key: "My Music", 
    label: "My Music",
    children: 
      [
        {
          icon: React.createElement(CloudDownloadOutlined),
          key: "Downloads", 
          label: "Downloads"
        }, 
        {
          icon: React.createElement(HeartOutlined),
          key: "Likes", 
          label: "Likes"
        }

      ]
  }, 

]

function UserProfile () {
  const [userName, setUserName] = useState("NULL");
  useEffect(() => {
    fetch('/api/userprofile')
      .then(res => res.json())
      .then(data => setUserName(data.email));
  });

  return(  <Layout>
    <Header className="header">
      <div className="logo" />
    </Header>

    <Layout>
      <Sider width={200} className="site-layout-background">
        <Menu
          mode="inline"
          defaultOpenKeys={["Recommend", "My Music"]}
          style={{
            height: '100%',
            borderRight: 0,
          }}
          items={sidebarItems}
        />
      </Sider>

      <Layout
        style={{
          padding: '0 24px 24px',
        }}
      >
        
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          <ProfileCard username={userName}/>
          <EditProfileForm/>
        </Content>
      </Layout>
    </Layout>
  </Layout>
)
};


export default UserProfile;