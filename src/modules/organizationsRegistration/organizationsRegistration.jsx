import React, { useState } from 'react';
import { Button, Form, Header, Input } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const OrganizationsRegistration = () => {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orgName: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false)

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.orgName.trim()) {
      errors.orgName = "Organization Name is required";
      isValid = false;
    }

    if (!formData.website.trim()) {
      errors.website = "Website is required";
      isValid = false;
    } else if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) {
      errors.website = "Website is invalid";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (loading) return
        const res = await apiPOST(`/v1/auth/register/send-otp`, formData)
        setLoading(false)
        if (res.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "OTP Sent Successfully!",
            icon: "success",
          });
          const encodedToken = encodeURIComponent(res?.data?.data);
          navigate(`/registration/verify?token=${encodedToken}`)
        }
        else {
          Toast.fire('Error!', res?.data?.data || "Something went wrong!", 'error');
        }
      } catch (error) {
        Toast.fire('Error!', error || "Something went wrong!", 'error');
      }
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
      <div style={{ width: '60%', height: '100%' }}>
        <div style={{ maxWidth: '100%',height: '94%', margin:'20px',backgroundColor: '#048def', borderRadius:'20px' }}></div>
      </div>
      <Form onSubmit={handleSubmit} style={{ width: '40%', padding: '50px' }}>
        <Header size='huge' style={{ marginBottom: '40px' }}>Orgnization Registration</Header>
        <Form.Field
          control={Input}
          label="Name"
          placeholder="Enter your name"
          name="name"
          style={{ marginBottom: `${!errors.name ? '10px' : '0px'}`, padding: '0px' }}
          value={formData.name}
          onChange={handleChange}
          error={errors.name ? true : false}
        />
        <Form.Field
          control={Input}
          label="Email"
          placeholder="Enter your email"
          name="email"
          style={{ marginBottom: '10px' }}
          value={formData.email}
          onChange={handleChange}
          error={errors.email ? true : false}
        />
        <Form.Field
          control={Input}
          label="Organization Name"
          placeholder="Enter your organization name"
          name="orgName"
          style={{ marginBottom: '10px' }}
          value={formData.orgName}
          onChange={handleChange}
          error={errors.orgName ? true : false}
        />
        <Form.Field
          control={Input}
          label="Website"
          placeholder="Enter your website URL"
          name="website"
          style={{ marginBottom: '10px' }}
          value={formData.website}
          onChange={handleChange}
          error={errors.website ? true : false}
        />
        <Button type="submit" style={{ width: '100%', marginTop: '20px' }} primary>Submit</Button>
      </Form>
    </div>
  );
};

export default OrganizationsRegistration;
