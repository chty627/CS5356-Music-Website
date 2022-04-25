import React from 'react';
import 'antd/dist/antd.css';

import { PageHeader, Menu, Dropdown, Button, Tag, Typography, Row } from 'antd';

const { Paragraph } = Typography;

function ProfileCard ({username}) {
  return (
    <PageHeader
      title= {username}
      className="site-page-header"
      subTitle="This is bio"
      avatar={{ src: '' , shape: 'square', size: 'large'}}
    >
    </PageHeader>
  );
}


export default ProfileCard;