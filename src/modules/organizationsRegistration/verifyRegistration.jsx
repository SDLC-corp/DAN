import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { apiPOST } from '../../utils/apiHelper';
import DataGeoComp from '../../components/authComponent/DataGeoComp';

const VerifyRegistration = ({ numInputs = 6 }) => {
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const [otp, setOtp] = useState(Array(numInputs).fill(''));
  const [error, setError] = useState('');

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

  const handleSubmit = async () => {
    const isOtpComplete = otp.every((val) => val.trim() !== '');
    if (!isOtpComplete) {
      setError('Please fill in all the fields correctly.');
      const firstEmptyIndex = otp.findIndex((val) => val.trim() === '');
      if (firstEmptyIndex !== -1) {
        inputRefs.current[firstEmptyIndex].focus();
      }
    } else {
      try {
        const payload = {
          otp: Number(otp.join('')),
          token: token,
        };
        const res = await apiPOST(`/v1/auth/register/verify-otp`, payload);
        if (res.status === 200) {
          Toast.fire('Success!', 'OTP Verified Successfully', 'success');
          const encodedToken = encodeURIComponent(token);
          navigate(`/signup/set-password?token=${encodedToken}`);
        } else {
          Toast.fire('Error!', res?.data?.data || 'Something went wrong!', 'error');
        }
      } catch (error) {
        console.log(error);
        Toast.fire('Error!', error || 'Something went wrong!', 'error');
      }
    }
  };

  const handleChange = (index, value) => {
    if (Number(value) >= 0 && Number(value) <= 9) {
      const numericValue = value.replace(/\D/g, '');

      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      if (value && index < numInputs - 1) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      setError('Invalid Input');
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="compdiv" style={{ width: '100%', display: 'flex' }}>
      <div className="imgtext" style={{ position: 'absolute', top: '55px' }}>
        <div style={{ display: 'flex', width: '222px', height: '147px', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/src/assets/image1.svg" alt="Image" style={{ width: '98px', height: '98px' }} />
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#048DEF' }}>Data Geometry</p>
        </div>
      </div>

      <div className="datageocomp" style={{ width: '60%', height: '100%' }}>
        <DataGeoComp />
      </div>
      <div style={{ width: window.innerWidth < 900 ? '80%' : '40%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h2 style={{ margin: '0' }}> Verify OTP</h2>
          <div style={{ marginBottom: '20px' }}>Verification code will send on your email id</div>
          <div>
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(input) => (inputRefs.current[index] = input)}
                style={{
                  width: window.innerWidth < 900 ? '43px' : '54px',
                  height: window.innerWidth < 900 ? '45px' : '61px',
                  fontSize: '20px',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginRight: window.innerWidth < 900 ? '5px' : '10px',
                  borderRadius: '8px',
                  border: `1px solid ${error ? '#ab3a38' : 'black'}`,
                }}
                onBlur={() => setError('')}
                pattern="[0-9]+"
              />
            ))}
          </div>
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <div></div>
            <Button type="submit" onClick={handleSubmit} style={{ borderRadius: '20px', marginTop: '10px' }} primary>
              Verify Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyRegistration;
