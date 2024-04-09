import React, { useContext, useState } from 'react';
import { Button, Form, Header, Input, Image } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import DataGeoComp from '../../components/authComponent/DataGeoComp';
import svgDescription from '../../assets/image1.svg';
import { AuthContext } from '../../contexts';

const SetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let auth = useContext(AuthContext);

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  let from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    password: '',
    rePassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    }
    if (!formData.rePassword.trim()) {
      errors.rePassword = true;
      isValid = false;
    }
    if (formData.password.trim() !== formData.rePassword.trim()) {
      errors.rePassword = 'Password Do Not Match!';
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
      const payload = {
        password: formData.password,
        token: token,
      };
      console.log(payload);
      try {
        if (loading) return;
        setLoading(true);
        const res = await apiPOST(`/v1/auth/register/set-password`, payload);
        console.log(res);
        if (res.status === 200) {
          let userDetails = {
            email: res?.data?.data,
            password: formData?.password,
          };
          console.log(userDetails);
          await auth.signin(userDetails, (type) => {
              let userObj = localStorage.getItem('user');
              type?.type == 'success' ? navigate(JSON.parse(userObj).role == 'superAdmin' ? from : '/dashboard', { replace: true }) :navigate(`/`);
          });
          
          Toast.fire('Success!', 'Password Saved Successfully', 'success');
          setLoading(false);

          navigate(`/`);
          
        } else {
          Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
          setLoading(false);

        }
      } catch (error) {
        setLoading(false);

        Toast.fire('Error!', error || 'Something went wrong!', 'error');
      }
    }
  };

  return (
    <div className="compdiv" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <div className="imgtext" style={{ position: 'absolute', top: '50px' }}>
        <div style={{ display: 'flex', width: '222px', height: '147px', flexDirection: 'column', alignItems: 'center' }}>
          <Image src={svgDescription} alt="Image" style={{ width: '98px', height: '98px' }} />
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#048DEF' }}>Data Geometry</p>
        </div>
      </div>
      <div className="datageocomp" style={{ width: '60%', height: '100%' }}>
        <DataGeoComp />
      </div>
      <div className="setpassformdiv" style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Form>
          <Header size="huge" style={{ marginBottom: '20px' }}>
            Set Password
          </Header>
          <Form.Field control={Input} label="New Password" placeholder="Enter New Password" type="password" name="password" style={{ marginBottom: `${!errors.password ? '10px' : '0px'}`, margin: '0', width: '360px' }} value={formData.password} onChange={handleChange} error={errors.password ? true : false} />

          <Form.Field control={Input} label="Confirm New Password" placeholder="Confirm New Password" type="password" name="rePassword" style={{ marginBottom: `${!errors.rePassword ? '10px' : '0px'}`, padding: '0px', width: '360px' }} value={formData.rePassword} onChange={handleChange} error={errors.rePassword ? true : false} />

          {errors.rePassword && <div style={{ color: 'red', marginTop: '10px' }}>{errors.rePassword}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <div></div>
            <Button type="submit" loading={loading} onClick={handleSubmit} style={{ borderRadius: '20px', marginTop: '10px' }} primary>
              Save Password
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SetPassword;
