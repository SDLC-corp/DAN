import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { apiPOST } from '../../utils/apiHelper';

const VerifyRegistration = ({ numInputs = 6 }) => {
    const inputRefs = useRef([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const [otp, setOtp] = useState(Array(numInputs).fill(''));
    const [error, setError] = useState("");


    
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

    const handleSubmit = async () => {
        const isOtpComplete = otp.every(val => val.trim() !== '');
        if (!isOtpComplete) {
            setError("Please fill in all the fields correctly.");
            const firstEmptyIndex = otp.findIndex(val => val.trim() === '');
            if (firstEmptyIndex !== -1) {
                inputRefs.current[firstEmptyIndex].focus();
            }
        } else {
            try {
                const payload = {
                    otp: Number(otp.join('')),
                    token: token
                }
                const res = await apiPOST(`/v1/auth/register/verify-otp`, payload)
                console.log(res);
                if (res.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: "OTP Verified Su",
                        icon: "success",
                    });
                }
                else {
                    Toast.fire('Error!', res?.data?.data || "Something went wrong!", 'error');
                }
            } catch (error) {
                console.log(error);
                Toast.fire('Error!', error || "Something went wrong!", 'error');
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
            setError("Invalid Input");
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && index > 0 && !otp[index]) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div style={{ width: '100%', display: 'flex' }}>
            <div style={{ width: '60%', height: '100%' }}>
                <div style={{ maxWidth: '100%', height: '94%', margin: '20px', backgroundColor: '#048def', borderRadius: '20px' }}></div>
            </div>
            <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                                    width: '54px',
                                    height: '61px',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    marginRight: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${error ? '#ab3a38' : 'black'}`,
                                }}
                                onBlur={() => setError("")}
                                pattern="[0-9]+"
                            />
                        ))}
                    </div>
                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <div></div>
                        <Button type="submit" onClick={handleSubmit} style={{ borderRadius: '20px', marginTop: '10px' }} primary>Verify Email</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyRegistration;
