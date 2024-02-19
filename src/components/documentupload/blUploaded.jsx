import React, { useContext, useEffect, useState } from 'react';
import DocumentUploadDrop from '../imageuploader/docUpload';
import { Button, Form } from 'semantic-ui-react';
import { AuthContext } from '../../contexts';
import { useNavigate } from 'react-router-dom';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';

const BlUpload = () => {
  let authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const [errorObj, setErrorObj] = useState({});
  const [shippingLineId, setShippingLineId] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [shippingLineList, setShippingLineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docNoLoading, setDocNoLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [assignToUserId, setAssignToUserId] = useState('');
  const [domainOptions, setDomainOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [extractionType, setExtractionType] = useState('bl');
  const airDocumentType = [
    { text: 'HAWBL', value: 'HAWBL' },
    { text: 'MAWBL', value: 'MAWBL' },
  ];
  const oceanDocumentType = [
    { text: 'HBL', value: 'HBL' },
    { text: 'MBL', value: 'MBL' },
  ];

  const initialDocObj = {
    bookingNo: '',
    documentNo: '',
    documentUrl: '',
    documentType: '',
    stageType: '',
    shippingLineId: '',
    documentNoVerified: false,
  };
  // document: "",

  const [docObj, setDocObj] = useState({
    ...initialDocObj,
    domainName: authContext.user?.domain?.[0] || '',
  });

  const updateDocObj = (key, value) => {
    setDocObj({ ...docObj, [key]: value });
  };

  useEffect(() => {
    updateDocObj('documentUrl', imageUrl);
    console.log('imageUrl ::', imageUrl);
  }, [imageUrl]);

  function updateUpload(url) {
    setImageUrl(url);
  }

  const onUploadDone = (data) => {
    updateUpload(data);
  };

  const getListOfShippingLine = async (extractionType) => {
    try {
      let response;
      const payload = {
        search: { name: searchQuery },
      };
      // if (searchQuery?.trim()) {
      //     const queryParams = objectToQueryParam(payload)
      //     response = await apiGET(`/v1/shipping-lines?${queryParams}`)
      // }else{
      // }
      response = await apiGET(`/v1/shipping-lines`);
      if (response.status === 200) {
        // console.log("response?.data?.data?.data", response?.data);
        let list = response?.data?.data?.data;
        if (list && list.length) {
          list = list.map((item) => {
            return {
              key: item.name,
              text: item.name,
              value: item._id,
            };
          });
        }
        setShippingLineList(list);
      } else {
        alertError(response?.data?.data);
      }
    } catch (error) {
      alertError('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  async function verifyDocument(orderBaseXid, domainName) {
    setDocNoLoading(true);
    let response = await apiGET(`/v1/documents/check/orderBases?documentNo=${orderBaseXid}&domainName=${domainName}`);

    if (response.status == '200') {
      response = response.data;

      if (response.data && response.data.docPresent) {
        alertSuccess('Document found in ERP', 'Document No: ' + orderBaseXid);
        updateDocObj('documentNoVerified', true);
      } else if (response.data && response.data.orderReleasesExisted) {
        alertWarning('Order Already Released', 'Document No: ' + orderBaseXid);
        updateDocObj('documentNoVerified', false);
      } else {
        alertWarning('Document not found in ERP');
        updateDocObj('documentNoVerified', false);
      }
    } else {
      alertError('Something went wrong');
      updateDocObj('documentNoVerified', false);
    }

    setDocNoLoading(false);

    //  if(response.data){

    //  } else {
    //   Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
    //  }
  }

  const saveBtnClickHandler = async () => {
    let payload = {
      shippingLineId: docObj.shippingLineId,
      documentUrl: docObj.documentUrl || 'https://artyfactassests.s3.ap-south-1.amazonaws.com/uploads/1692697809182/How-to-submit-shipping-instruction_0.pdf',
      documentType: docObj.documentType,
      documentNo: docObj.documentNo,
    };

    if (user.role != 'documentation' && assignToUserId) {
      payload = { ...payload, assignToUserId: assignToUserId };
    }

    setLoading(true);
    let response = await apiPOST(`/v1/documents?extractionType=${extractionType}`, payload);
    setLoading(false);
    // console.log("/v1/documents ::", response);
    if (response?.status == '200') {
      Swal.fire({
        title: 'Success!',
        text: 'Document added successfully',
        icon: 'success',
      });

      setDocObj(initialDocObj);
      setImageUrl('');
      setAssignToUserId('');
      navigate('/dashboard/document-list');
    } else {
      if (response?.status == '403') {
        Swal.fire({
          title: 'Alredy Exist!',
          html: `<div style="display: flex; flex-direction:column; justify-content: center;">A Booking with this <div style="text-align: left; margin-left: 80px;"><span style={{margin: 0 20px;}}>Document No : ${docObj?.documentNo},</span><br/><span style={{margin: 0 20px;}}></span><br/> <span style={{margin: 0 20px;}}>Location : ${docObj?.domainName}</span><br/></div>already exist, kindly delete the previous to proceed with adding new one.</div>`,
          icon: 'error',
        });
      } else {
        alertError(response?.data?.data);
      }
    }
  };

  const onCheckClickHandler = async () => {
    let docVerified = await verifyDocument(docObj.documentNo, docObj.domainName);
  };

  // const transformData = (data) => {
  //     const map = {};
  //     const roots = [];
  //     data.forEach((item) => {
  //         item.children = [];
  //         map[item._id] = item;
  //         if (item.parentId == null) {
  //             roots.push(item);
  //         } else {
  //             if (!map[item.parentId].children) {
  //                 map[item.parentId].children = [];
  //             }
  //             map[item.parentId].children.push(item);
  //         }
  //     });
  //     // convert it into nodepath
  //     let array = getNodePaths(roots[0],roots[0].label)
  //     return array;
  // };

  const transformData = (data) => {
    const map = {};
    const roots = [];

    // Create a map of _id to the item and initialize children as an empty array
    data.forEach((item) => {
      item.children = [];
      map[item._id] = item;
    });

    // Iterate through the data to build the tree structure
    data.forEach((item) => {
      const parentItem = map[item.parentId];
      if (parentItem) {
        parentItem.children.push(item);
      } else {
        roots.push(item); // If no parent found, treat it as a root element
      }
    });
    // convert it into nodepath
    let array = getNodePaths(roots[0], roots[0].label);
    return array;
    return roots;
  };

  function getNodePaths(node, parentPath = '') {
    if (node.children && node.children.length > 0) {
      return node.children.reduce((paths, child) => {
        const childPath = getNodePaths(child, parentPath + '/' + child.label);
        return paths.concat(childPath);
      }, []);
    } else {
      return [parentPath];
    }
  }

  const getDomain = async () => {
    try {
      let response = await apiGET('/v1/domain/');
      if (response.status === 200) {
        const arr = transformData(response.data.data);
        let list = arr;
        if (list && list.length) {
          list = list.map((item) => {
            return {
              key: item,
              text: item,
              value: item,
            };
          });
        }
        setDomainOptions(list);
      } else {
        Swal.fire({
          title: 'Error!',
          text: response?.data?.data,
          icon: 'error',
        });
      }
    } catch (error) {
       Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
      });
    }
  };

  const getDomainOptions = () => {
    if (user.role === 'superAdmin') {
      getDomain();
    } else {
      let list = user?.domain;
      if (list && list.length) {
        list = list.map((item) => {
          return {
            key: item,
            text: item,
            value: item,
          };
        });
      }
      setDomainOptions(list);
    }
  };

  useEffect(() => {
    if (searchQuery !== '' || extractionType !== '') {
      getListOfShippingLine(extractionType);
    }
  }, [searchQuery,extractionType]);

  useEffect(() => {
    getDomainOptions();
  }, [user]);

  const handleShippingLineSearchQuery = (e, { searchQuery }) => {
    setSearchQuery(searchQuery);
  };

  const sortShippingLineOptions = (options, query) => {
    if (query?.trim()) {
      let searchQuery1 = query?.toLowerCase();
      let arr2 = shippingLineList.filter((option) => option.text.toLowerCase().includes(searchQuery1)).sort((a, b) => a.text - b.text);
      return [...arr2];
    } else {
      let copy = shippingLineList;
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    }
  };

  return (
    <>
      <div class="ui grid">
        <div class="eight wide column">
          <label>
            <strong>
              Upload Document<span style={{ color: 'red' }}>*</span>{' '}
            </strong>
          </label>
          <DocumentUploadDrop imageUrl={docObj.documentUrl} onUploadDone={onUploadDone} disabled={loading} />
        </div>
        <div className="eight wide column">
          <Form style={{ width: '100%' }}>
            <Form.Dropdown
              label={'BL Types'}
              placeholder={'Select BL Types'}
              //   options={shippingLineList}
              options={sortShippingLineOptions(shippingLineList, searchQuery)}
              required={true}
              search={true}
              searchQuery={searchQuery}
              onSearchChange={handleShippingLineSearchQuery}
              clearable
              error={errorObj && errorObj.fieldId}
              selection
              onFocus={() => {
                setErrorObj();
              }}
              value={docObj.shippingLineId}
              disabled={loading}
              onChange={(e, data) => {
                updateDocObj('shippingLineId', data.value);
                // setDocObj({...docObj,shippingLineId: data.value});
                setSearchQuery('');
              }}
            />

            <Form.Field id="form-input-control-token-tracker" label="Document Number" required={true} style={{ marginTop: '18px', marginBottom: 0 }} disabled={loading}></Form.Field>

            <div className="ui action input" style={{ marginBottom: 18, display: 'flex' }}>
              <input
                style={{ flex: 1 }}
                type="text"
                placeholder="Document Number"
                value={docObj.documentNo || ''}
                disabled={loading}
                onChange={(e, data) => {
                  updateDocObj('documentNo', e.target.value);
                }}
              />
            </div>
            <Button loading={loading} disabled={loading || docNoLoading || !imageUrl} content="Save" fluid primary onClick={saveBtnClickHandler} />
          </Form>
        </div>
      </div>
    </>
  );
};

export default BlUpload;
