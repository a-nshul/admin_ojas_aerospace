'use client';

import React, { useEffect, useState } from 'react';
import { message, Spin, Card, Col, Row,Modal,Button,Form,Input } from 'antd';
import { EditOutlined, DeleteOutlined,PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import './UserProfile.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getCachedData = () => {
    const cachedData = localStorage.getItem('users');
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      const cacheAge = 1000 * 60 * 5; 
      if (Date.now() - timestamp < cacheAge) {
        return data; 
      }
    }
    return null;
  };


  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');

      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }
      const response = await axios.get('http://13.126.247.129:3001/api/admin/get/user/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Admin-ID': adminId,
        },
        params: {
          page: page,
          pageSize: pagination.pageSize,
        },
      });

      setUsers(response.data.user);
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalCount, 
      }));
      
    //   setCacheData(response.data.user); 
    console.log("egdvegde", response.data.user)
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };
  const handleTableChange = (pagination) => {
    setPagination(pagination);
    fetchUsers(pagination.current);
  };

  useEffect(() => {
    fetchUsers(pagination.current);
  }, [pagination.current]);

  const showModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };
  const showEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedUser(null);
    form.resetFields();
  };
  const showAddModal = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');

      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }

      const updatedData = form.getFieldsValue();
      const response = await axios.put(
        `http://13.126.247.129:3001/api/admin/update/user/${selectedUser._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );

      message.success(response.data.message);
      fetchUsers(); // Refresh user list after successful update
      setIsEditModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update user.');
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsAddModalVisible(false)
    setSelectedUser(null);
  };
const handleAddSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');
  
      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }
  
      const newUser = form.getFieldsValue();
  
      const address = {
        state: newUser.state,
        district: newUser.district,
        pinCode: newUser.pinCode,
        area: newUser.area,
        locationType: newUser.locationType,
        latitude: newUser.latitude,  
        longitude: newUser.longitude, 
      };
  
      const { state, district, pinCode, area, locationType, latitude, longitude, ...userData } = newUser;
  
      const payload = {
        ...userData,
        address: [address], 
      };
  
      const response = await axios.post(
        'http://13.126.247.129:3001/api/admin/create/user',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );
  
      message.success(response.data.message);
      fetchUsers(); 
      setIsAddModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add user.');
    }
  };
  
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');

      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }

      const response = await axios.delete(
        `http://13.126.247.129:3001/api/admin/delete/user/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );

      message.success(response.data.message);
      fetchUsers(); 
      setIsModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user.');
    }
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        form.setFieldsValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);
  
  return (
    <div className="user-container">
      <div className="header"> 
       <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          className="add-user-btn"
        >
          Add User
        </Button>
      </div>
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : (
        <Row gutter={[16, 24]}>
          {users.map((user) => (
            <Col span={8} key={user._id}>
              <Card
                className="user-card"
                title={<span>
                    {user.name}
                    <EditOutlined key="edit" style={{ marginLeft: 10 }} onClick={() => showEditModal(user)}/>
                    <DeleteOutlined key="delete" style={{ marginLeft: 10 }} onClick={() => showModal(user)} />
                  </span>}
                bordered={false}
                hoverable
              >
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Mobile No:</strong> {user.mobileNo}</p>
                <p><strong>description:</strong> {user.description}</p>
                <p><strong>State:</strong> {user.address[0]?.state}</p>
                <p><strong>District:</strong> {user.address[0]?.district}</p>
                <p><strong>pinCode:</strong> {user.address[0]?.pinCode}</p>
                <p><strong>area:</strong> {user.address[0]?.area}</p>
                <p><strong>locationType:</strong> {user.address[0]?.locationType}</p>
                <p><strong>latitude:</strong> {user.address[0]?.latitude}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <Modal
        title="Add User"
        visible={isAddModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddSave}>
            Add User
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required!' }]}>
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required!' }]}>
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item name="mobileNo" label="Mobile Number" rules={[{ required: true, message: 'Mobile number is required!' }]}>
            <Input placeholder="Enter mobile number" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>
          {/* Address Details */}
          <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'State is required!' }]}
            >
                <Input placeholder="Enter state" />
          </Form.Item>
          <Form.Item
                name="district"
                label="State"
                rules={[{ required: true, message: 'District is required!' }]}
            >
                <Input placeholder="Enter state" />
          </Form.Item>
          <Form.Item
                name="pinCode"
                label="pinCode"
                rules={[{ required: true, message: 'pinCode is required!' }]}
            >
                <Input placeholder="Enter state" />
          </Form.Item>
          <Form.Item
                name="area"
                label="area"
                rules={[{ required: true, message: 'area is required!' }]}
            >
                <Input placeholder="Enter state" />
          </Form.Item>
            <Form.Item
                name="locationType"
                label="locationType"
                rules={[{ required: true, message: 'locationType is required!' }]}
            >
                <Input placeholder="Enter locationType" />
            </Form.Item>
            <Form.Item label="Longitude" name="longitude" rules={[{ required: true, message: 'Longitude is required' }]}>
            <Input type="number" />
            </Form.Item>
            <Form.Item label="Latitude" name="latitude" rules={[{ required: true, message: 'Latitude is required' }]}>
            <Input type="number" />
            </Form.Item>
        </Form>
      </Modal>
      {/* Edit Modal */}
      <Modal
        title="Edit User"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="back" onClick={handleEditCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSave}>
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required!' }]}>
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username is required!' }]}>
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item name="mobileNo" label="Mobile Number" rules={[{ required: true, message: 'Mobile number is required!' }]}>
            <Input placeholder="Enter mobile number" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>
           {/* Address Details */}
            <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'State is required!' }]}
            >
                <Input placeholder="Enter state" />
            </Form.Item>

            <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: 'District is required!' }]}
            >
                <Input placeholder="Enter district" />
            </Form.Item>

            <Form.Item
                name="pinCode"
                label="Pin Code"
                rules={[{ required: true, message: 'Pin code is required!' }]}
            >
                <Input placeholder="Enter pin code" />
            </Form.Item>

            <Form.Item
                name="area"             
                label="Area"
                rules={[{ required: true, message: 'Area is required!' }]}
            >
                <Input placeholder="Enter area" />
            </Form.Item>

            <Form.Item
                name="locationType"
                label="Location Type"
                rules={[{ required: true, message: 'Location type is required!' }]}
            >
                <Input placeholder="Enter location type" />
            </Form.Item>

            <Form.Item
                name="latitude"
                label="Latitude"
                rules={[{ required: true, message: 'Latitude is required!' }]}
            >
                <Input type="number" placeholder="Enter latitude" />
            </Form.Item>

            <Form.Item
                name="longitude"
                label="Longitude"
                rules={[{ required: true, message: 'Longitude is required!' }]}
            >
                <Input type="number" placeholder="Enter longitude" />
            </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Confirm Deletion"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" danger onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>
    </div>
  );
};

export default Users;
