import React, { useState } from 'react';
import { Button, Form, Header, Input } from 'semantic-ui-react';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import DataGeoComp from '../../components/authComponent/DataGeoComp';

const SetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        rePassword: '',
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

        if (!formData.password.trim()) {
            errors.password = "Password is required";
            isValid = false;
        }
        if (!formData.rePassword.trim()) {
            errors.rePassword = true;
            isValid = false;
        }
        if (formData.password.trim() !== formData.rePassword.trim()) {
            errors.rePassword = "Password Do Not Match!";
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
                token: token
            }
            try {
                if (loading) return
                const res = await apiPOST(`/v1/auth/register/set-password`, payload)
                setLoading(false)
                if (res.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "Password Successfully!",
                        icon: "success",
                    });
                    navigate(`/`)
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
        <div className='compdiv' style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>

<div className='imgtext'>
    <div style={{display: 'flex',width: '222px',height: '147px', flexDirection: 'column', alignItems: 'center'}}>
      <img  src="/src/assets/image1.svg" alt="Image" style={{ width: '98px', height: '98px'}}/>
      <p style={{fontSize: '28px', fontWeight: '600', color: '#048DEF'}}>Data Geometry</p>
    </div>
    </div>
            <div className='datageocomp' style={{ width: '60%', height: '100%' }}>
                    <DataGeoComp/>
            </div>
            <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Form>
                    <Header size='huge' style={{ marginBottom: '20px' }}>Set Password</Header>
                    <Form.Field
                        control={Input}
                        label="New Password"
                        placeholder="Enter New Password"
                        type='password'
                        name="password"
                        style={{ marginBottom: `${!errors.password ? '10px' : '0px'}`, margin: '0', width: '360px' }}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password ? true : false}
                    />

                    <Form.Field
                        control={Input}
                        label="Confirm New Password"
                        placeholder="Confirm New Password"
                        type='password'
                        name="rePassword"
                        style={{ marginBottom: `${!errors.rePassword ? '10px' : '0px'}`, padding: '0px', width: '360px' }}
                        value={formData.rePassword}
                        onChange={handleChange}
                        error={errors.rePassword ? true : false}
                    />
                        
                    {errors.rePassword  && <div style={{ color: 'red', marginTop: '10px' }}>{errors.rePassword }</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <div></div>
                        <Button type="submit" onClick={handleSubmit} style={{ borderRadius: '20px', marginTop: '10px' }} primary>Verify Email</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default SetPassword;
