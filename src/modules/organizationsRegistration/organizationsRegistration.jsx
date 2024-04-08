import React, { useState } from 'react';
import { Button, Form, Header, Input, Message } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import DataGeoComp from '../../components/authComponent/DataGeoComp';
import { Link } from 'react-router-dom';

const OrganizationsRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orgName: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.orgName.trim()) {
      errors.orgName = 'Organization Name is required';
      isValid = false;
    }

    if (!formData.website.trim()) {
      errors.website = 'Website is required';
      isValid = false;
    } else if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) {
      errors.website = 'Website is invalid';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleChange = (e, { name, value }) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFoucsed = () => {
    setErrors({ name: '', email: '', orgName: '', website: '' });
    setEmailFocused(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (loading) return;
        setLoading(true);
        const res = await apiPOST(`/v1/auth/register/send-otp`, formData);
        setLoading(false);
        if (res.status === 200) {
          Toast.fire('Success!', 'OTP Verified Successfully', 'success');
          const encodedToken = encodeURIComponent(res?.data?.data);
          navigate(`/signup/verify?token=${encodedToken}`);
        } else {
          Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
        }
      } catch (error) {
        Toast.fire('Error!', error || 'Something went wrong!', 'error');
      }
    }
  };

  return (
    <div className="compdiv" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="imgtext">
        <div style={{ display: 'flex', width: '222px', height: '147px', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/src/assets/image1.svg" alt="Image" style={{ width: '98px', height: '98px' }} />
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#048DEF' }}>Data Geometry</p>
        </div>
      </div>

      <div className="datageocomp" style={{ width: '60%', height: '100%' }}>
        <DataGeoComp />
      </div>

      <div style={{ width: '40%', padding: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="mobdiv">
          <Form onSubmit={handleSubmit} style={{ width: '400px' }}>
            <Header size="huge" style={{ marginBottom: '16px' }}>
              Sign up
            </Header>
            <Form.Field control={Input} label="Full Name" placeholder="Enter your name" name="name" style={{ marginBottom: `${!errors.name ? '10px' : '0px'}`, padding: '0px', width: window.innerWidth < 900 ? '335px' : '400px' }} value={formData.name} onChange={handleChange} error={errors.name ? true : false} onFocus={handleFoucsed} />
            {errors.name?.trim() ? (
              <div style={{ marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{errors.name}</Message.Content>
                </Message>{' '}
              </div>
            ) : (
              ''
            )}
            <Form.Field control={Input} label="Work Email" placeholder="Enter your email" name="email" style={{ marginBottom: `${!errors.email ? '10px' : '0px'}`, padding: '0px', width: window.innerWidth < 900 ? '335px' : '400px' }} value={formData.email} onChange={handleChange} onFocus={handleFoucsed} error={errors.email ? true : false} />
            {errors.email?.trim() ? (
              <div style={{ marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{errors.email}</Message.Content>
                </Message>{' '}
              </div>
            ) : (
              ''
            )}
            <Form.Field control={Input} label="Organization Name" placeholder="Enter your organization name" name="orgName" style={{ marginBottom: `${!errors.orgName ? '10px' : '0px'}`, padding: '0px', width: window.innerWidth < 900 ? '335px' : '400px' }} value={formData.orgName} onChange={handleChange} error={errors.orgName ? true : false} onFocus={handleFoucsed} />
            {errors.orgName?.trim() ? (
              <div style={{ marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{errors.orgName}</Message.Content>
                </Message>{' '}
              </div>
            ) : (
              ''
            )}
            <Form.Field control={Input} label="Website" placeholder="Enter your website URL" name="website" style={{ marginBottom: `${!errors.website ? '10px' : '0px'}`, padding: '0px', width: window.innerWidth < 900 ? '335px' : '400px' }} value={formData.website} onChange={handleChange} error={errors.website ? true : false} onFocus={handleFoucsed} />
            {errors.website?.trim() ? (
              <div style={{ marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{errors.website}</Message.Content>
                </Message>{' '}
              </div>
            ) : (
              ''
            )}
            {/* <Button type="submit" style={{ width: '100%', marginTop: '20px' }} primary>Submit</Button> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: '500' }}>
                {emailFocused && formData.email && formData.email.includes('@gmail.com') && (
                  <span>
                    <div>Verification code will send on your email id</div>{' '}
                    <div>
                      <strong style={{ color: '#0369CA' }}>{formData.email}</strong>
                    </div>
                  </span>
                )}
              </div>

              <Button type="submit" loading={loading} primary style={{ padding: '12px 34px', borderRadius: '65px', fontSize: '12px', fontWeight: '500', backgroundColor: '#048DEF' }}>
                Next <i class="arrow right icon " style={{ color: 'white', width: '5px', fontSize: 'larger' }}></i>
              </Button>
            </div>
          </Form>
        </div>

        <div style={{ position: 'absolute', bottom: '30px' }}>
          Don't have an account?
          <Link to="/" style={{ fontWeight: '600', fontSize: '15px' }} onMouseOver={(e) => (e.target.style.textDecoration = 'underline')} onMouseOut={(e) => (e.target.style.textDecoration = 'none')}>
            {' '}
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsRegistration;
