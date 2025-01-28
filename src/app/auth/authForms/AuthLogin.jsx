'use client'
import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import CustomCheckbox from '@/app/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import AuthSocialButtons from './AuthSocialButtons';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password) {
  //     message.error('Please enter both email and password.');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const response = await axios.post('http://localhost:3001/api/admin/login', {
  //       email,
  //       password,
  //     });

  //     if (response.data) {
  //       localStorage.setItem('token', response.data.token);
  //       localStorage.setItem('user', JSON.stringify(response.data.user));
  //       message.success('Login successful!');
  //       // Navigate to the desired page after login
  //       router.push('/');
  //     }
  //   } catch (error) {
  //     message.error(
  //       error.response?.data?.message || 'Login failed. Please check your credentials.'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      message.error('Please enter both email and password.');
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post('http://13.126.247.129:3001/api/admin/login', {
        email,
        password,
      });
  
      if (response.data) {
        const admin = response.data.admin;
  
        // Check if the user role is superAdmin
        if ( admin.role !== 'superAdmin') {
          message.error('You are not a superadmin. Access denied.');
          return;
        }
  
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(admin));
        localStorage.setItem('adminId', admin.id);
        message.success('Login successful!');
        router.push('/apps/chats');
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {/* <AuthSocialButtons title="Sign in with" /> */}
      {/* <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign in with
          </Typography>
        </Divider>
      </Box> */}

      <form onSubmit={handleLogin}>
        <Stack>
          <Box mb={2}>
            <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
            <CustomTextField
              id="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box mb={2}>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked />}
                label="Remember this Device"
              />
            </FormGroup>
          </Stack>
        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
