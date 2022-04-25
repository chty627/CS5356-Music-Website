import React, { useState } from 'react';
import 'antd/dist/antd.css';
import {
  Form,
  Input,
  Button,
  DatePicker
} from 'antd';

const EditProfileForm = () => {


  return (
    <Form
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 14,
      }}
      layout="horizontal"
      size="default"
    >
        
      <Form.Item label="Username">
        <Input />
      </Form.Item>

      <Form.Item label="Password">
        <Input />
      </Form.Item>
      <Form.Item label="Bio">
        <Input />
      </Form.Item>

      <Form.Item label="Birth Date">
        <DatePicker />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>

    </Form>
  );
};

export default () => <EditProfileForm />;