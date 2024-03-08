import React, { useContext, useEffect, useState } from 'react';
import { Form, Message, Button } from 'semantic-ui-react';
import { apiGET, apiPUT } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import { AuthContext } from '../../contexts';

const Setting = () => {

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

  const { user } = useContext(AuthContext);
  console.log(user);
  const [loading, setLoading] = useState(false)
  const [orgDetails, setOrgDetails] = useState({
    orgName: '',
    orgWeb: '',
    syncApiUrl: ''
  })
  const [apiUrlError, setApiUrlError] = useState('')

  const getOrganizationDetails = async () => {
    try {
      const res = await apiGET(`/v1/organizations/`);
      if (res.status === 200) {
        setOrgDetails({
          ...orgDetails,
          orgName: res.data.data.name,
          orgWeb: res.data.data.website,
          syncApiUrl: res.data.data.syncApiUrl,
        });
      }
    } catch (error) {
      console.log("Error :", error);
    }
  };

  const updateApiUrl = async () => {
    if (orgDetails.syncApiUrl == undefined || orgDetails.syncApiUrl == '') {
      setApiUrlError('Please Provide API URL')
      return
    }
    try {
      setLoading(true)
      const res = await apiPUT(`/v1/organizations/`, { syncApiUrl: orgDetails.syncApiUrl });
      if (res.status === 200) {
        Toast.fire('Success!', "API URL Updated!", 'success')
        getOrganizationDetails();
        setLoading(false)
      } else {
        setApiUrlError('Unable To Update API URL, Please Try again in some time!')
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      setApiUrlError('Unable To Update API URL, Please Try again in some time!')
      console.log("Error :", error);
    }
  };

  useEffect(() => {
    getOrganizationDetails()
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', padding: '30px', width: '100%' }}>
      <div className="" style={{ backgroundColor: '#E1EEFF', width: '100%', borderRadius: '20px' }}>
        <div style={{ padding: '20px 30px' }}>
          <div className="header-text">Organization Details</div>
        </div>
        <div style={{ backgroundColor: 'white', width: '98%', margin: '10px', borderRadius: '20px', padding: '10px 10px', display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <div style={{ padding: '15px 10px', borderRadius: '10px', display: 'flex' }}>
              <div style={{ fontWeight: '700', width: '80px' }}>Name </div> <div style={{ fontWeight: '700', marginRight: '30px' }} >:</div> <div>{orgDetails?.orgName}</div>
            </div>
            <div style={{ padding: '15px 10px', borderRadius: '10px', display: 'flex' }}>
              <div style={{ fontWeight: '700', width: '80px' }}>Website </div> <div style={{ fontWeight: '700', marginRight: '30px' }} >:</div> <div>{orgDetails?.orgWeb}</div>
            </div>
          </div>
          <div style={{ width: '50%' }}>
            <div style={{ padding: '15px 10px', borderRadius: '10px', display: 'flex' }}>
              <div style={{ fontWeight: '700', width: '180px' }}>Organization Admin </div> <div style={{ fontWeight: '700', marginRight: '30px' }} >:</div> <div>{user?.name}</div>
            </div>
            <div style={{ padding: '15px 10px', borderRadius: '10px', display: 'flex' }}>
              <div style={{ fontWeight: '700', width: '180px' }}>Work Email </div> <div style={{ fontWeight: '700', marginRight: '30px' }} >:</div> <div>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="" style={{ backgroundColor: '#E1EEFF', width: '100%', borderRadius: '20px', marginTop: '30px' }}>
        <div style={{ padding: '20px 30px' }}>
          <div className="header-text">Sync Setting</div>
        </div>
        <Form style={{ backgroundColor: 'white', width: '98%', margin: '10px', borderRadius: '20px', padding: '10px 20px ' }} noValidate>
          <div style={{ display: 'flex', gap: '10px', width: '100%', }}>
            <div style={{ width: '50%' }}>
              <Form.Input
                style={{ width: '100%' }}
                label="Your API URL "
                placeholder="Email"
                type="email"
                value={orgDetails.syncApiUrl}
                onChange={(e) => setOrgDetails({ ...orgDetails, syncApiUrl: e.target.value })}
                onFocus={() => {
                  setApiUrlError('')
                }}
                error={apiUrlError ? true : false}
              />
              <div style={{ width: '70%', marginBottom: '5px' }}>
                {apiUrlError ? <Message className="fadeIn" color="red" size="small">
                  <Message.Content>{apiUrlError}</Message.Content>
                </Message> : ''}
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <Button
                content="Update"
                primary
                loading={loading}
                size="large"
                onClick={updateApiUrl}
                style={{ borderRadius: '10px', fontSize: '15px', fontWeight: '400', padding: '11px 34px 11px 34px' }}
              />
            </div>
          </div>

        </Form>
      </div>

    </div>
  );
};

export default Setting;
