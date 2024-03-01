import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts';
import { Button, Form, Grid, Segment, Image, Message, Label } from 'semantic-ui-react';
import LogoImg from '../../assets/images/sdlc-logo.png';
import DataGeoComp from '../../components/authComponent/DataGeoComp';
import { intlFormat } from 'date-fns';
import { Link } from 'react-router-dom';

function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorstate, setErrorstate] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [emailError, setEmailError] = useState('');


  let from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let user = localStorage.getItem('accesstoken');
    if (user) {
      navigate(from, { replace: true });
    }
  }, []);


  const check_validation = (userDetails) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    console.log(gmailRegex.test(userDetails.email))
    let flag = false
    if (!userDetails.email) {
      setEmailError('Please provide Email');
      setErrorstate(true);
      setLoading(false);
      flag = true
    }else if(!gmailRegex.test(userDetails.email)){
      setEmailError('Please provide valid Email')
      setErrorstate(true);
      setLoading(false);
      flag = true
    }
    if (!userDetails.password) {
      setErrorMessage('Please Provide Password');
      setErrorstate(true);
      setLoading(false);
      flag = true
    }
    if(flag == true){
      return false
    }else{
      return true
    }

  };
  function handleSubmit() {
    setLoading(true);
    let userDetails = {
      email: email,
      password: password,
    };
    const validated = check_validation(userDetails);
    if (validated) {
      auth.signin(userDetails, (type) => {
        let userObj = localStorage.getItem('user');
        type.type == 'success' ? navigate(JSON.parse(userObj).role == 'superAdmin' ? from : '/dashboard', { replace: true }) : setErrorMessage(type.type), setErrorstate(true), setLoading(false);
      });
    }
  }
  return (
    <div className='compdiv' style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
    
    <div className='imgtext' style={{position: 'absolute', top: '50px'}}>
    <div style={{display: 'flex',width: '222px',height: '147px', flexDirection: 'column', alignItems: 'center'}}>
      <img  src="/src/assets/image1.svg" alt="Image" style={{ width: '98px', height: '98px'}}/>
      <p style={{fontSize: '28px', fontWeight: '600', color: '#048DEF'}}>Data Geometry</p>
    </div>
    </div>
      
      <div className='datageocomp' style={{ width: '60%', height: '100%' }}>
        <DataGeoComp />
      </div>

      <div style={{ width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className='mobdiv'>
          <label style={{ fontSize: '24px', fontWeight: 600 }}>Login</label>
          <Form style={{ marginTop: '20px' }} noValidate>
            <Form.Input
              style={{ width:window.innerWidth < 900 ? '335px' :  '400px' }}
              label="Email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              onFocus={() => {
                setErrorstate(false);
                setEmailError('');
                setErrorMessage('')
              }}
              error={emailError ? true : false}
            />
            {errorstate && emailError?.trim() ? (
              <div style={{ width: '70%', marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{emailError}</Message.Content>
                </Message>
              </div>
            ) : (
              ''
            )}

            <Form.Input
            
              style={{width:window.innerWidth < 900 ? '335px' :  '400px', margin: '0' }}
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              onFocus={() => {
                setErrorMessage('')
                setErrorstate(false)
                setEmailError(''); 
              }}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              action={{
                icon: passwordVisible ? 'eye slash' : 'eye',
                onClick: () => setPasswordVisible(!passwordVisible),
              }}
              error={ errorMessage ? true : false}
            />
            {errorstate && errorMessage?.trim() ? (
              <div style={{ width: '70%', marginBottom: '5px' }}>
                <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{errorMessage}</Message.Content>
                </Message>{' '}
              </div>
            ) : (
              ''
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '17px' }}>
              <a href="/forgot-password" style={{ fontSize: '14px', fontWeight: '500' }}>
                {/* Forgot Password? */}
              </a>
              <div>
                <Button content="Login" primary loading={loading} disabled={loading} size="large" onClick={handleSubmit} style={{ borderRadius: '65px', fontSize: '15px', fontWeight: '400', padding: '11px 34px 11px 34px' }} />
              </div>
            </div>
          </Form>
        </div>
        <div style={{ position: 'absolute', bottom: '30px' }}>
          Already have an account?
          <Link to="/registration" style={{ fontWeight: '600', fontSize: '15px',  }}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {' '}
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
