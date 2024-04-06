import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Icon, Image, Input, Modal } from 'semantic-ui-react';

const UpgradePlan = () => {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneno: '',
    orgname: '',
  })
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorstate, setErrorstate] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  // const items = [
  //   {
  //     header: 'Free',
  //     description:
  //       'Leverage agile frameworks to provide a robust synopsis for high level overviews.',
  //     meta: 'ROI: 30%',
  //   },
  //   {
  //     header: 'Project Report - May',
  //     description:
  //       'Bring to the table win-win survival strategies to ensure proactive domination.',
  //     meta: 'ROI: 34%',
  //   },
  // ]
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const check_validation = (userDetails) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    let flag = false;

    if(!userDetails.name){
      setErrorMessage('please provide Name')
      setErrorstate(true);
      flag = true;
    }
    if (!userDetails.email) {
      setEmailError('Please provide Email');
      setErrorstate(true);
      // setLoading(false);
      flag = true;
    } else if (!gmailRegex.test(userDetails.email)) {
      setEmailError('Please provide valid Email');
      setErrorstate(true);
      // setLoading(false);
      flag = true;
    }
    if (!userDetails.password) {
      setErrorMessage('Please Provide Password');
      setErrorstate(true);
      setLoading(false);
      flag = true;
    }
    if (flag == true) {
      return false;
    } else {
      return true;
    }
  };

  function handleSubmit() {
    // setLoading(true);
    let userDetails = {
      name: formData.name,
      email: formData.email,
      phoneno: formData.phoneno,
      orgname: formData.orgname,
    };
    const validated = check_validation(userDetails);
    // if (validated) {
    //   auth.signin(userDetails, (type) => {
    //     let userObj = localStorage.getItem('user');
    //     type.type == 'success' ? navigate(JSON.parse(userObj).role == 'superAdmin' ? from : '/dashboard', { replace: true }) : setErrorMessage(type.type), setErrorstate(true), setLoading(false);
    //   });
    // }
  }

  return (
    <div style={{ backgroundColor: '#f0efef', height: '100%' , overflow: 'auto'}}>
      {/* <h1 className='bg-linear-gradient'>Upgrade Plan</h1>
      <div className='text-linear-gradient' style={{fontWeight:'800', fontSize:'20px'}}>text-linear-gradient</div> */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '80px', gap: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/src/assets/image1.svg" alt="Description of the SVG image" style={{ width: '100px', height: '100px' }} />
          <span style={{ fontSize: '50px', lineHeight: '30px', fontWeight: '700' }}>Pricing</span>
        </div>
        <div style={{ fontSize: '25px' }}>Pay only for what you need</div>

        <div style={{display:'flex', gap:'20px'}}>
          <div style={{ width: '500px', height: '200px', borderRadius: '20px', backgroundColor: "white", padding: '15px',display: 'flex', flexDirection: 'column', justifyContent: 'space-between',  paddingBottom: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="text-linear-gradient" style={{ fontSize: '30px', fontWeight: '900', height: '25px' }}>
                Free
              </div>
              <div style={{ fontWeight: '500', fontSize: '15px', color: '#565656' }}>For basic plan you have 10 free documents for Data Extraction.</div>
            </div>
            <div style={{  fontSize: '20px', fontWeight: '600' }}>10 Documents</div>
          </div>




          <div style={{ width: '500px', height: '200px', borderRadius: '20px', backgroundColor:  'white' , padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '17px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold' }}>Professional</div>
              <div style={{ fontWeight: '500', fontSize: '15px', color: '#565656' }}>For Professional plan you have to spend 10 cents per PDF for Data Extraction.</div>
            </div>
            <div style={{  display: 'flex', justifyContent: 'space-between', width: '90%', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>10 cents/PDF</div>
              <button
                onClick={() => {
                  setOpenModal(!openModal);
                }}
                style={{ backgroundColor: '#048def', borderRadius: '20px', padding: '10px 30px', fontWeight:  '500', color:  'white', border: 'none' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <CardComponent openModal={openModal} setOpenModal={setOpenModal} />
    </div>
  );
};

const CardComponent = ({ loading, docNoLoading, imageUrl, saveBtnClickHandler, openModal, setOpenModal, onUploadDone, docObj, refNo, setRefNo, refNoError, setRefNoError }) => (
 
  <Modal open={openModal} closeIcon={'close'} onClose={() => setOpenModal(!openModal)} closeOnDimmerClick={false} style={{ padding: '25px', borderRadius: '20px', width: '500px' }}>
    <div>
      <h2>Professional Account Request</h2>
      <div style={{ marginBottom: '10px' }}>Name</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Name"
        required={true}
        // onChange={handleChange}
        // value={formData.name}
        // value={refNo}
        // onChange={(e) => {
        //   setRefNoError('')
        //   setRefNo(e.target.value);
        // }}
        style={{ width: '100%'}}
        // error={refNoError ? true : false}

      />
      <div style={{ marginBottom: '10px', marginTop: '10px' }}>Email</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Email"
        // onChange={handleChange}
        // value={formData.email}
        required={true}
        style={{ width: '100%' }}

      />
      <div style={{ marginBottom: '10px', marginTop: '10px' }}>Phone no</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Phone no"
        // value={formData.phoneno}
        // onChange={handleChange}
        required={true}
        style={{ width: '100%' }}
      />
      <div style={{ marginBottom: '10px',  marginTop: '10px' }}>Organization Name</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Org Name"
        // value={formData.orgname}
        // onChange={handleChange}
        required={true}
        style={{ width: '100%' }}
      />
      <div style={{ marginBottom: '10px',  marginTop: '10px' }}>Comment</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Comment"
        // onChange={handleChange}
        required={true}
        style={{ width: '100%' }}
      />
      {/* {refNoError ? <div style={{ color: '#ab3a38', padding: '10px 0', fontSize: '10px' }}>{refNoError}</div> : ''}  */}
    </div>
     {/* <div style={{ paddingBottom: '30px', paddingTop: '20px' }}> */}
      {/* <div style={{ marginBottom: '10px' }}>Upload Document <span style={{ color: "red" }}>*</span></div> */}
      {/* <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} disabled={loading} minHeight='15vh' /> */}
    {/* </div> */}
    {/* <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}> */}
      <Button
        style={{ width: '100%', borderRadius: '20px',  marginTop: '15px' }}
        icon="upload"

        // loading={loading} disabled={loading || docNoLoading || !imageUrl}
        // content='Save' fluid onClick={saveBtnClickHandler} primary
      >Request</Button>
    {/* </div> */}
  </Modal>
);

export default UpgradePlan;

