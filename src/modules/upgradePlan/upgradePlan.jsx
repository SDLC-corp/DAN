import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Icon, Image, Input, Modal, Message } from 'semantic-ui-react';
import DataGeometryLogo from '../../assets/images/data-geometry.svg';
import Swal from 'sweetalert2';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { AuthContext } from '../../contexts';
import DescriptionImage from '../../assets/image1.svg'

const UpgradePlan = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div style={{ backgroundColor: '#f0efef', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '40px', gap: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Image src={DescriptionImage} alt="Description of the SVG image" style={{ width: '100px', height: '100px' }} />
          <span style={{ fontSize: '50px', lineHeight: '30px', fontWeight: '700' }}>Pricing</span>
        </div>
        <div style={{ fontSize: '25px' }}>Pay only for what you need</div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ width: '500px', height: '200px', borderRadius: '20px', backgroundColor: 'white', padding: '20px ', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="text-linear-gradient" style={{ fontSize: '30px', fontWeight: '900', height: '25px' }}>
                Free
              </div>
              <div style={{ fontWeight: '500', fontSize: '15px', color: '#565656' }}>For basic plan you have 10 free documents for Data Extraction.</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>10 Documents</div>
          </div>

          <div style={{ width: '500px', height: '200px', borderRadius: '20px', backgroundColor: 'white', padding: '20px ', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '17px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold' }}>Professional</div>
              <div style={{ fontWeight: '500', fontSize: '15px', color: '#565656' }}>For Professional plan you have to spend 10 cents per PDF for Data Extraction.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>10 cents/PDF</div>
              <button
                onClick={() => {
                  setOpenModal(!openModal);
                }}
                style={{ cursor: 'pointer', backgroundColor: '#048def', borderRadius: '20px', padding: '10px 30px', fontWeight: '500', color: 'white', border: 'none' }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <CardComponent openModal={openModal} setOpenModal={setOpenModal} />
    </div>
  );
};

const CardComponent = ({ openModal, setOpenModal }) => {
  const { user } = useContext(AuthContext);
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
  const [orgName, setOrgName] = useState();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orgName: '',
    phone: '',
    comment: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.orgName.trim()) {
      newErrors.orgName = 'Organization Name is required';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const res = await apiPOST(`/v1/organizations/professional-account-request`, formData);
        setLoading(false);

        if (res.status === 200) {
          setFormData({
            name: '',
            email: '',
            orgName: '',
            phone: '',
            comment: '',
          });
          setOpenModal(false);
          Toast.fire('Success!', 'Professional Account Request Successfully Sent!', 'success');
        } else {
          Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
        }
      } catch (error) {
        Toast.fire('Error!', error || 'Something went wrong!', 'error');
      }
    }
  };
  const getOrgStatus = async () => {
    try {
      let response = await apiGET(`/v1/organizations`);
      if (response.status === 200) {
        setOrgName(response.data.data.name);
      } else {
        Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
      }
    } catch (error) {
      Toast.fire('Error!', error || 'Something went wrong!', 'error');
    }
  };

  useEffect(() => {
    getOrgStatus();
  }, [user]);

  useEffect(() => {
    setFormData({
      ...formData,
      name: user.name,
      email: user.email,
      orgName: orgName,
    });
  }, [user, orgName]);

  return (
    <Modal open={openModal} closeIcon={'close'} onClose={() => setOpenModal(!openModal)} closeOnDimmerClick={false} style={{ padding: '25px', borderRadius: '20px', width: '500px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Image src={DataGeometryLogo} alt="logo" style={{ width: '50px' }} /> <div style={{ fontSize: '20px', fontWeight: '800' }}>Professional Account Request</div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>Name*</div>
          <Form.Field control={Input} placeholder="Enter your Name" name="name" style={{ padding: '0px', width: '100%' }} value={formData.name} onChange={handleChange} onFocus={handleFoucsed} error={errors.name ? true : false} />
          {errors.name?.trim() ? (
            <div style={{ marginBottom: '5px' }}>
              <Message className="fadeIn" color="red" size="tiny">
                <Message.Content>{errors.name}</Message.Content>
              </Message>{' '}
            </div>
          ) : (
            ''
          )}

          <div style={{ marginBottom: '10px', marginTop: '10px' }}>Email*</div>
          <Form.Field control={Input} placeholder="Enter your Email" name="email" style={{ padding: '0px', width: '100%' }} value={formData.email} onChange={handleChange} onFocus={handleFoucsed} error={errors.email ? true : false} />
          {errors.email?.trim() ? (
            <div style={{ marginBottom: '5px' }}>
              <Message className="fadeIn" color="red" size="tiny">
                <Message.Content>{errors.email}</Message.Content>
              </Message>{' '}
            </div>
          ) : (
            ''
          )}

          <div style={{ marginBottom: '10px', marginTop: '10px' }}>Phone Number*</div>
          <Form.Field control={Input} placeholder="Enter your Phone Number" name="phone" style={{ padding: '0px', width: '100%' }} value={formData.phone} onChange={handleChange} onFocus={handleFoucsed} error={errors.phone ? true : false} />
          {errors.phone?.trim() ? (
            <div style={{ marginBottom: '5px' }}>
              <Message className="fadeIn" color="red" size="tiny">
                <Message.Content>{errors.phone}</Message.Content>
              </Message>{' '}
            </div>
          ) : (
            ''
          )}

          <div style={{ marginBottom: '10px', marginTop: '10px' }}>Organization Name*</div>
          <Form.Field control={Input} placeholder="Enter your Organization Number" name="orgName" style={{ padding: '0px', width: '100%' }} value={formData.orgName} onChange={handleChange} onFocus={handleFoucsed} error={errors.orgName ? true : false} />
          {errors.orgName?.trim() ? (
            <div style={{ marginBottom: '5px' }}>
              <Message className="fadeIn" color="red" size="tiny">
                <Message.Content>{errors.orgName}</Message.Content>
              </Message>{' '}
            </div>
          ) : (
            ''
          )}

          <div style={{ marginBottom: '10px', marginTop: '10px' }}>Comment </div>
          <Form.Field control={Input} placeholder="Enter your Comment" name="comment" style={{ marginBottom: `${!errors.comment ? '10px' : '0px'}`, padding: '0px', width: '100%' }} value={formData.comment} onChange={handleChange} onFocus={handleFoucsed} error={errors.comment ? true : false} />
        </div>
      </div>

      <Button onClick={handleSubmit} loading={loading} className="bg-linear-gradient req-btn" style={{ width: '100%', borderRadius: '20px', marginTop: '15px', color: 'white', marginBottom: '10px' }} icon="upload">
        Request Professional Account
      </Button>
    </Modal>
  );
};

export default UpgradePlan;
