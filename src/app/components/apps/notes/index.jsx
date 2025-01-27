'use client';

import React, { useEffect, useState } from 'react';
import { message, Spin, Card, Col, Row, Button,Modal ,Form,Input,Select,DatePicker} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../../apps/chats/UserProfile.css';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
   const [selectedFarmer, setSelectedFarmer] = useState(null);
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
   const [isAddModalVisible, setIsAddModalVisible] = useState(false);
   const [form] = Form.useForm();
  const fetchFarmers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');
  
      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }
      const response = await axios.get('http://13.126.247.129:3001/api/admin/get/farmer/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Admin-ID': adminId,
        },
        params: {
          page: page,
          pageSize: pagination.pageSize,
        },
      });
  
      // Update farmers with the correct data
      setFarmers(response.data.farmer);
      setPagination((prev) => ({
        ...prev,
        total: response.data.countFarmer,
      }));
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };
  
  const showModal = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalVisible(true);
  };
  const handleTableChange = (pagination) => {
    setPagination(pagination);
    fetchFarmers(pagination.current);
  };
  const showAddModal = () => {
    setIsAddModalVisible(true);
    form.resetFields();
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
        `http://13.126.247.129:3001/api/admin/delete/farmer/${selectedFarmer._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );

      message.success(response.data.message);
      fetchFarmers(); 
      setIsModalVisible(false);
      setSelectedFarmer(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete farmer.');
    }
  };
  useEffect(() => {
    fetchFarmers(pagination.current);
  }, [pagination.current]);
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsAddModalVisible(false)
    setSelectedFarmer(null);
  };
  const showEditModal = (user) => {
    setSelectedFarmer(user);
    setIsEditModalVisible(true);
    form.setFieldsValue(user);
  };
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setSelectedFarmer(null);
    form.resetFields();
  };
const handleAddSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const adminId = localStorage.getItem('adminId');
      
      if (!token) {
        message.error('Token is missing. Please log in again.');
        return;
      }
      
      if (!adminId) {
        message.error('Admin ID is missing. Please log in again.');
        return;
      }
      
      const values = await form.validateFields();
      
      // Build the dynamic payload
      const payload = {
        farmerName: values.farmerName,
        mobileNo: values.mobileNo,
        farmDetails: {
          farmStatus: values.farmStatus,
          farmName: values.farmName,
          farmArea: values.farmArea,
          farmAreaUnit: values.farmAreaUnit,
          address: values.address,
          state: values.state,
          pincode: values.pincode,
          location: {
            type: "Point",
            coordinates: values.location?.coordinates || [] // Expecting an array like [lat, long]
          },
          status:
            values.irrigation?.status || []
          ,
          plot: {
            type: "Polygon",
            coordinates: values.plot?.coordinates || [] // If plot coordinates are provided
          }
        },
        cropDetails: [
          {
            nameOfCrop: values.nameOfCrop,
            cropType: values.cropType,
            sowingDate: values.sowingDate?.format("YYYY-MM-DD"), // Assuming moment.js format
            cropArea: values.cropArea,
            cropAreaUnit: values.cropAreaUnit,
            cropDescription: values.cropDescription
          }
        ]
      };
      
      const response = await axios.post(
        'http://13.126.247.129:3001/api/admin/create/farmer',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );
      
      message.success(response.data.message);
      fetchFarmers(); 
      setIsAddModalVisible(false); 
      
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add farmer.');
    }
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
        `http://13.126.247.129:3001/api/admin/update/farmer/${selectedFarmer._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Admin-ID': adminId,
          },
        }
      );

      message.success(response.data.message);
      fetchFarmers(); 
      setIsEditModalVisible(false);
    } catch (error) {
        console.log("egvegfr",error.message);
      message.error(error.response?.data?.message || 'Failed to update farmer.');
    }
  };
  return (
    <div className="user-container">
      <div className="header">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          className="add-user-btn"
        >
          Add Farmer
        </Button>
      </div>
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : (
        <Row gutter={[16, 24]}>
          {Array.isArray(farmers) && farmers.map((farmer) => (
            <Col span={8} key={farmer._id}>
                <Card
                className="user-card"
                title={
                    <span>
                    {farmer.farmerName}
                    <EditOutlined key="edit" style={{ marginLeft: 10 }} onClick={() => showEditModal(farmer)}/>
                    <DeleteOutlined key="delete" style={{ marginLeft: 10 }} onClick={() => showModal(farmer)} />
                    </span>
                }
                bordered={false}
                hoverable
                >
                <p><strong>Mobile No:</strong> {farmer.mobileNo}</p>
                <p><strong>FarmName:</strong> {farmer.farmDetails?.farmName || 'N/A'}</p>
                <p><strong>FarmArea:</strong> {farmer.farmDetails?.farmArea || 'N/A'}</p>
                <p><strong>FarmAreaUnit:</strong> {farmer.farmDetails?.farmAreaUnit || 'N/A'}</p>
                <p><strong>farmStatus:</strong> {farmer.farmDetails?.farmStatus || 'N/A'}</p>
                <p><strong> irrigation status:</strong> {farmer.farmDetails?.irrigation?.status || 'N/A'}</p>
                <p><strong> irrigation period:</strong> {farmer.farmDetails?.irrigation?.period || 'N/A'}</p>
                <p><strong> irrigation waterQuantity:</strong> {farmer.farmDetails?.irrigation?.waterQuantity || 'N/A'}</p>
                <p><strong> irrigation method:</strong> {farmer.farmDetails?.irrigation?.method || 'N/A'}</p>
                <p><strong> location type:</strong> {farmer.farmDetails?.location?.type || 'N/A'}</p>
                <p>
                <strong>Location Coordinates:</strong>{' '}
                {farmer.farmDetails?.location?.coordinates
                    ? `Latitude: ${farmer.farmDetails.location.coordinates[1]}, Longitude: ${farmer.farmDetails.location.coordinates[0]}`
                    : 'N/A'}
                </p>
                <p><strong>Address:</strong> {farmer.farmDetails?.address}</p>
                <p><strong>State:</strong> {farmer.farmDetails?.state}</p>
                <p><strong>Pincode:</strong> {farmer.farmDetails?.pincode}</p>
                {/* //hs */}
                {/* <p><strong>HsId:</strong> {farmer.halSaathi?.hsId}</p> */}
                {/* <p><strong>HsName:</strong> {farmer.halSaathi?.hsName}</p> */}
                {/* //DC */}
                {/* <p><strong>DcId:</strong> {farmer.dc?.dcId}</p> */}
                {/* <p><strong>DcName:</strong> {farmer.dc?.dcName}</p> */}
                {/* Crop details */}
                {/* <p><strong>Crop Details:</strong></p> */}
                {Array.isArray(farmer.cropDetails) && farmer.cropDetails.length > 0 ? (
                    farmer.cropDetails.map((crop, index) => (
                    <div key={crop._id} style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                        {/* <p><strong>Crop {index + 1}:</strong></p> */}
                        {/* <p><strong>Crop ID:</strong> {crop.cropId}</p> */}
                        <p><strong>Crop Name:</strong> {crop.nameOfCrop}</p>
                        <p><strong>Showing date Type:</strong> {crop.sowingDate}</p>
                        <p><strong>Crop Area:</strong> {crop.cropArea} {crop.cropAreaUnit}</p>
                        <p><strong>Crop Description:</strong> {crop.cropDescription}</p>
                        {/* <p><strong>Crop Report Status:</strong> {crop.cropReportStatus}</p> */}
                    </div>
                    ))
                ) : (
                    <p>No crop details available.</p>
                )}
                </Card>
            </Col>
            ))}
        </Row>
      )}
      <Modal
        title="Add Farmer"
        visible={isAddModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddSave}>
            Add Farmer
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
        <Form.Item
              name="farmerName"
              label="Farmer Name"
              rules={[{ required: true, message: "Please enter the farmer's name" }]}
            >
              <Input placeholder="Enter farmer's name" />
            </Form.Item>

            {/* Mobile Number */}
            <Form.Item
              name="mobileNo"
              label="Mobile Number"
              rules={[
                { required: true, message: "Please enter the mobile number" },
                { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number" },
              ]}
            >
              <Input placeholder="Enter mobile number" />
            </Form.Item>

            {/* Farm Name */}
            <Form.Item
              name="farmName"
              label="Farm Name"
              rules={[{ required: true, message: "Please enter the farm name" }]}
            >
              <Input placeholder="Enter farm name" />
            </Form.Item>

            {/* Farm Area */}
            <Form.Item
              name="farmArea"
              label="Farm Area"
              rules={[{ required: true, message: "Please enter the farm area" }]}
            >
              <Input className="w-full" placeholder="Enter farm area" />
            </Form.Item>

            {/* Location Coordinates */}
            <Form.Item
              name={["location", "coordinates"]}
              label="Location Coordinates"
              rules={[{ required: true, message: "Please enter location coordinates" }]}
            >
              <Input placeholder="Enter coordinates (e.g., [lat, long])" />
            </Form.Item>

            {/* Farm Status */}
            <Form.Item
              name="farmStatus"
              label="Farm Status"
              rules={[{ required: true, message: "Please select a farm status" }]}
            >
              <Select placeholder="Select farm status">
                <Option value="cropped">Cropped</Option>
                <Option value="harvested">Harvested</Option>
                <Option value="ploughed">Ploughed</Option>
              </Select>
            </Form.Item>

            {/* Irrigation Status */}
            <Form.Item
              name="status"
              label="Irrigation Status"
              rules={[{ required: true, message: "Please select irrigation status" }]}
            >
              <Select placeholder="Select irrigation status">
                <Option value="irrigated">Irrigated</Option>
                <Option value="required">Required</Option>
                <Option value="rainfed">Rainfed</Option>
              </Select>
            </Form.Item>

            {/* Name of Crop */}
            <Form.Item
              name="nameOfCrop"
              label="Name of Crop"
              rules={[{ required: true, message: "Please enter the crop name" }]}
            >
              <Input placeholder="Enter crop name" />
            </Form.Item>

            {/* Sowing Date */}
            <Form.Item
              name="sowingDate"
              label="Sowing Date"
              rules={[{ required: true, message: "Please select the sowing date" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            {/* Crop Area Unit */}
            <Form.Item
              name="cropAreaUnit"
              label="Crop Area Unit"
              rules={[{ required: true, message: "Please enter the crop area unit" }]}
            >
              <Input placeholder="Enter crop area unit (e.g., acres)" />
            </Form.Item>

            {/* Crop Description */}
            <Form.Item
              name="cropDescription"
              label="Crop Description"
              rules={[{ required: true, message: "Please enter the crop description" }]}
            >
              <Input.TextArea placeholder="Enter crop description" rows={3} />
            </Form.Item>

            {/* Farm Area Unit */}
            <Form.Item
              name="farmAreaUnit"
              label="Farm Area Unit"
              rules={[{ required: true, message: "Please enter the farm area unit" }]}
            >
              <Input placeholder="Enter farm area unit (e.g., hectares)" />
            </Form.Item>

            {/* Address */}
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter the address" }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} />
            </Form.Item>

            {/* State */}
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Please enter the state" }]}
            >
              <Input placeholder="Enter state" />
            </Form.Item>

            {/* Pincode */}
            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[
                { required: true, message: "Please enter the pincode" },
                { pattern: /^\d{6}$/, message: "Enter a valid 6-digit pincode" },
              ]}
            >
              <Input placeholder="Enter pincode" />
            </Form.Item>
        </Form>
      </Modal>
      {/* //delete  */}
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
        <p>Are you sure you want to delete this farmer?</p>
      </Modal>
      <Modal
        title="Edit Farmer"
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
                {/* Farmer Name */}
                <Form.Item
                    name="farmerName"
                    label="Farmer Name"
                    rules={[{ required: true, message: "Please enter the farmer's name" }]}
                >
                    <Input placeholder="Enter farmer's name" />
                </Form.Item>
                
                {/* Mobile Number */}
                <Form.Item
                    name="mobileNo"
                    label="Mobile Number"
                    rules={[
                        { required: true, message: "Please enter the mobile number" },
                        { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number" },
                    ]}
                    >
                        <Input placeholder="Enter mobile number" />
                    </Form.Item>
                    
                {/* Farm Name */}
                <Form.Item
                    name="farmName"
                    label="Farm Name"
                    rules={[{ required: true, message: "Please enter the farm name" }]}
                >
                    <Input placeholder="Enter farm name" />
                </Form.Item>
                
                {/* Farm Area */}
                <Form.Item
                    name="farmArea"
                    label="Farm Area"
                    rules={[{ required: true, message: "Please enter the farm area" }]}
                >
                    <Input className="w-full" placeholder="Enter farm area" />
                </Form.Item>
                
                {/* Location Coordinates */}
                <Form.Item
                    name={["location", "coordinates"]}
                    label="Location Coordinates"
                    rules={[{ required: true, message: "Please enter location coordinates" }]}
                >
                    <Input placeholder="Enter coordinates (e.g., [lat, long])" />
                </Form.Item>
                
                {/* Farm Status */}
                <Form.Item
                    name="farmStatus"
                    label="Farm Status"
                    rules={[{ required: true, message: "Please select a farm status" }]}
                >
                    <Select placeholder="Select farm status">
                        <Option value="cropped">Cropped</Option>
                        <Option value="harvested">Harvested</Option>
                        <Option value="ploughed">Ploughed</Option>
                    </Select>
                </Form.Item>
                
                {/* Irrigation Status */}
                <Form.Item
                    name="irrigationStatus"
                    label="Irrigation Status"
                    rules={[{ required: true, message: "Please select irrigation status" }]}
                >
                    <Select placeholder="Select irrigation status">
                        <Option value="irrigated">Irrigated</Option>
                        <Option value="required">Required</Option>
                        <Option value="rainfed">Rainfed</Option>
                    </Select>
                </Form.Item>
                
                {/* Name of Crop */}
                <Form.Item
                    name="nameOfCrop"
                    label="Name of Crop"
                    rules={[{ required: true, message: "Please enter the crop name" }]}
                >
                    <Input placeholder="Enter crop name" />
                </Form.Item>
                
                {/* Sowing Date */}
                <Form.Item
                    name="sowingDate"
                    label="Sowing Date"
                    rules={[{ required: true, message: "Please select the sowing date" }]}
                >
                    <DatePicker className="w-full" />
                </Form.Item>
                
                {/* Crop Area Unit */}
                <Form.Item
                    name="cropAreaUnit"
                    label="Crop Area Unit"
                    rules={[{ required: true, message: "Please enter the crop area unit" }]}
                >
                    <Input placeholder="Enter crop area unit (e.g., acres)" />
                </Form.Item>
                
                {/* Crop Description */}
                <Form.Item
                    name="cropDescription"
                    label="Crop Description"
                    rules={[{ required: true, message: "Please enter the crop description" }]}
                >
                    <Input.TextArea placeholder="Enter crop description" rows={3} />
                </Form.Item>
                
                {/* Farm Area Unit */}
                <Form.Item
                    name="farmAreaUnit"
                    label="Farm Area Unit"
                    rules={[{ required: true, message: "Please enter the farm area unit" }]}
                >
                    <Input placeholder="Enter farm area unit (e.g., hectares)" />

                </Form.Item>
                
                {/* Address */}
                <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: "Please enter the address" }]}
                >
                    <Input.TextArea placeholder="Enter address" rows={3} />
                </Form.Item>
                
                {/* State */}
                <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: "Please enter the state" }]}
                >
                    <Input placeholder="Enter state" />
                </Form.Item>
                
                {/* Pincode */}
                <Form.Item
                    name="pincode"
                    label="Pincode"
                    rules={[
                        { required: true, message: "Please enter the pincode" },
                        { pattern: /^\d{6}$/, message: "Enter a valid 6-digit pincode" },
                    ]}
                    >
                        <Input placeholder="Enter pincode" />
                    </Form.Item>
                    </Form>
        </Modal>
    </div>
  );
};

export default Farmers;
