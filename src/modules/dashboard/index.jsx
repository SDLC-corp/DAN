import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Form, Icon, Image, Input, Modal } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import { Chart as ChartsJs, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

import { useNavigate } from 'react-router-dom';
import { alertError } from '../../utils/alerts';
import { AuthContext } from '../../contexts';
import DocumentUploadDrop from '../../components/imageuploader/docUpload';
import UpgradePlanModal from '../../components/modal/upgradePlanModal';

ChartsJs.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, ArcElement);

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const initialDocObj = {
    documentUrl: '',
    documentTypeId: '',
  };
  const [openModal, setOpenModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState('');
  const [docNoLoading, setDocNoLoading] = useState(false);
  const [docObj, setDocObj] = useState({ ...initialDocObj });
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [uploadType, setUploadType] = useState(null);
  const [refNo, setRefNo] = useState('');
  const [refNoError, setRefNoError] = useState(false);
  const [isModalOpen,setIsModalOpen] = useState(false);

  const [isFreeAccount, setIsFreeAccount] = useState(false);
  const [uploadedDocCoount, setUploadedDocCoount] = useState(0);

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

  const saveBtnClickHandler = async () => {
    let payload = {
      documentTypeId: docObj.documentTypeId,
      documentUrl: docObj.documentUrl || 'https://artyfactassests.s3.ap-south-1.amazonaws.com/uploads/1692697809182/How-to-submit-shipping-instruction_0.pdf',
      documentNo: refNo,
    };

    if (user.role != 'documentation' && assignToUserId) {
      payload = { ...payload, assignToUserId: assignToUserId };
    }

    setLoading(true);
    let response = await apiPOST('/v1/documents', payload);
    setLoading(false);
    if (response?.status == '200') {
      Toast.fire('Success!', 'Document added successfully', 'success');

      setDocObj(initialDocObj);
      setImageUrl('');
      setAssignToUserId('');
      navigate('/dashboard/document-list');
    } else {
      if (response?.status == '403') {
        // Toast.fire({
        //   icon: 'error',
        //   title: 'Already Exist!',
        //   html: `<div style="display: flex; flex-direction:column; justify-content: center;">A Booking with this <div style="text-align: left; margin-left: 80px;"><span style={{margin: 0 20px;}}>Document No : ${docObj?.documentNo},</span><br/><span style={{margin: 0 20px;}}></span><br/> <span style={{margin: 0 20px;}}>Location : ${docObj?.domainName}</span><br/></div>already exist, kindly delete the previous to proceed with adding new one.</div>`
        // });
        Toast.fire('Error While uploading document!', response?.data?.message || 'Something went wrong!', 'error');

        console.log(error);
      } else {
        alertError(response?.data?.data);
      }
    }
  };

  function updateUpload(url) {
    setImageUrl(url);
  }

  const onUploadDone = (data) => {
    updateUpload(data);
  };
  const updateDocObj = (key, value) => {
    setDocObj({ ...docObj, [key]: value });
  };
  const getOrgStatus = async () => {
    try {
      let response = await apiGET(`/v1/organizations`);
      if (response.status === 200) {
        setUploadedDocCoount(response.data.data?.documentUploadedCount || 0);
        setIsFreeAccount(response.data.data?.isFreeAccount || true);
      } else {
        Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
      }
    } catch (error) {
      Toast.fire('Error!', error || 'Something went wrong!', 'error');
    }
  };
  const getAllDocumentTypeList = async () => {
    try {
      let response = await apiGET(`/v1/document-type/list`);
      if (response.status === 200) {
        let list = response?.data?.data?.data;
        if (list && list.length) {
          const uniqueTexts = new Set();
          list = list.filter((item) => {
            const text = item?.name;
            if (!uniqueTexts.has(text)) {
              uniqueTexts.add(text);
              return true;
            }
            return false;
          });
          list = list.map((item) => {
            return {
              key: item?.code,
              text: item?.name,
              value: item?._id,
              logo: item?.logo,
              description: item?.description,
            };
          });
        }
        setDocumentTypeOptions(list);
        updateDocObj('documentTypeId', list?.[0]?.value);
      } else {
        Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
      }
    } catch (error) {
      Toast.fire('Error!', error || 'Something went wrong!', 'error');
    }
  };

  useEffect(() => {
    updateDocObj('documentUrl', imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    getAllDocumentTypeList();
    getOrgStatus();
  }, []);
  return (
    <div className="fadeIn  page-content-wrapper " style={{ paddingBottom: '150px', margin: '10px' }}>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'row ', flexWrap: 'wrap', gap: '25px' }}>
        {documentTypeOptions.length > 0 ? (
          documentTypeOptions.map((type, index) => (
            <div key={index} style={{ width: '258px' }}>
              {type?.logo ? <img src={type?.logo} style={{ width: '254px', height: '140px', borderRadius: '10.4px' }}></img> : <div style={{ width: '254px', height: '140px', borderRadius: '10.4px', backgroundColor: '#F0EFEF' }}></div>}
              <div style={{ marginTop: '8px', fontWeight: '700' }}>{type.text}</div>
              <div style={{ fontSize: '12px' }}>{type.description}</div>
              <button
                onClick={() => {
                  if (isFreeAccount && (uploadedDocCoount >= 10)) {
                    setIsModalOpen(true)
                  } else {
                    setOpenModal(!openModal);
                    updateDocObj('documentTypeId', type.value);
                  }
                }}
                style={{ border: 'none', color: '#048DEF', background: 'transparent', fontWeight: '500', cursor: 'pointer', marginTop: '10px' }}>
                <Icon name="upload" /> Upload Document
              </button>
            </div>
          ))
        ) : (
          <div style={{ width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', color: '#acbdcd' }}>There are no records to display</div>
        )}
        <CardComponent loading={loading} docNoLoading={docNoLoading} imageUrl={imageUrl} saveBtnClickHandler={saveBtnClickHandler} openModal={openModal} setOpenModal={setOpenModal} onUploadDone={onUploadDone} docObj={docObj} uploadType={uploadType} setRefNo={setRefNo} refNo={refNo} refNoError={refNoError} setRefNoError={setRefNoError} />
      </div>
      <UpgradePlanModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen}/>
    </div>
  );
}

const CardComponent = ({ loading, docNoLoading, imageUrl, saveBtnClickHandler, openModal, setOpenModal, onUploadDone, docObj, refNo, setRefNo, refNoError, setRefNoError }) => (
  <Modal open={openModal} closeIcon={'close'} onClose={() => setOpenModal(!openModal)} closeOnDimmerClick={false} style={{ padding: '25px', borderRadius: '20px', width: '500px' }}>
    <div>
      <h2>Upload Document</h2>
      <div style={{ marginBottom: '10px' }}>Document Number (Reference No.)</div>
      <Form.Field
        id="form-input-control-first-name"
        control={Input}
        placeholder="Enter Document No."
        required={true}
        value={refNo}
        onChange={(e) => {
          setRefNoError('');
          setRefNo(e.target.value);
        }}
        style={{ width: '100%' }}
        error={refNoError ? true : false}
      />
      {refNoError ? <div style={{ color: '#ab3a38', padding: '10px 0', fontSize: '10px' }}>{refNoError}</div> : ''}
    </div>
    <div style={{ paddingBottom: '30px', paddingTop: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        Upload Document <span style={{ color: 'red' }}>*</span>
      </div>
      <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} disabled={loading} minHeight="15vh" />
    </div>
    <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
      <Button style={{ width: '100px', borderRadius: '20px' }} icon="upload" loading={loading} disabled={loading || docNoLoading || !imageUrl} content="Save" fluid onClick={saveBtnClickHandler} primary />
    </div>
  </Modal>
);

export default Dashboard;
