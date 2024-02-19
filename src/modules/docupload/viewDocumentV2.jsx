import React, { useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Grid, Header, Divider, Icon, Input, Label, Form, Modal, Pagination, Container, Sidebar, Table, Dropdown, List, Popup, Tab } from 'semantic-ui-react';
import { apiGET, apiPOST, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { alertError, alertSuccess } from '../../utils/alerts';
import { useProSidebar } from 'react-pro-sidebar';
import moment from 'moment';
import ReuploadDocument from './reuploadDocument';
import RemoteDocumentDropdown from '../../components/remotedropdown/remoteDocumentDropdown';
import ContainerTypeDropdown from '../../components/dropdown/conatinerTypeDropdown';
import SealNumberCompTypeDropdown from '../../components/dropdown/sealNumberCompTypeDropdown';
import StatusView from '../job/viewStatus';
import { AuthContext } from '../../contexts';
import AssignToModal from '../../components/modal/assignToModal';
import Swal from 'sweetalert2';
import PackageTypeDropdown from '../../components/dropdown/packageTypeDropdown';
import ItemMasterDropdown from '../../components/dropdown/itemMasterDropdown';

const sections = [
  { key: 'Dashboard', content: 'Dashboard', link: true, to: '/dashboard' },
  {
    key: 'Documents List',
    content: 'Documents List',
    link: true,
    to: '/dashboard/document-list',
  },
  //   { key: 'Documents View', content: 'Documents View', active: true },
];
export default function ViewDocument() {
  let { id } = useParams();
  const [docObj, setDocObj] = useState({});
  const [visible, setVisible] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rawModal, setRawModal] = useState(false)
  const [rawModalData, setRawModalData] = useState({})
  const [onChangeClearCanvas, setOnChangeClearCanvas] = useState(false)
  const [count, setCount] = useState(0)
  let { user } = useContext(AuthContext);
  const [extractLoading, setExtractLoading] = useState(false);
  const [openAssignToModal, setOpenAssignToModal] = useState(false)
  const [clearSelectedState, setClearSelectedState] = useState(0);

  const navigate = useNavigate();

  const getData = async (id) => {
    try {
    let data = await apiGET('/v1/documents/' + id);
        if (data.status == '200') {
        const doc = data.data.data;
        setDocObj(doc);
        if (doc?.extractedData?.documents) {
        setRawModalData(doc?.extractedData?.documents[0]?.fields)
        }
        }else if (data.status == "401") {
            Swal.fire({
                title: "Error !",
                text: data?.data?.data||"Document Not Found",
                icon: "error",
            });
            navigate("/dashboard/document-list")
        } else {
            Swal.fire({
                title: "Error !",
                text:"Document Not Found",
                icon: "error",
            });
            navigate("/dashboard/document-list")
        } 
    } catch (error) {
        console.log('error',error);
        Swal.fire({
            title: "Error !",
            text:error,
            icon: "error",
         });
    }
  };

 

  const pushToOTMClickHandler = async () => {
    if (pushLoading) return;

    setPushLoading(true);
    let res = await apiPOST('/v1/job', { documentId: id });
    // console.log('pushToOTMClickHandler ::', res);
    setPushLoading(false);

    if (res.status == '200') {
      getData(id);
      setCount(count + 1)
      //   alertSuccess("The 'Push to ERP' process has been successfully initiated. To view its status, please navigate to the 'Jobs' page.");
      alertSuccess("ERP Synchronization Started.");
      navigate("/dashboard/document-list")
    } else {
      alertError(res?.data?.data || 'Something went wring');
    }
  };

  const extract = async () => {
    if (pushLoading) return;

    setExtractLoading(true);
    let res = await apiPOST('/v1/documents/processExtractedFields/' + id);
    // console.log('extractLoading ::', res);
    setExtractLoading(false);

    if (res.status == '200') {
      alertSuccess('Extraction Done');
      getData(id);
    } else {
      alertError(res?.data?.data || 'Something went wring');
    }
  };

  const getPercentage = (fieldsAndValues) => {
    let count = 0;
    for (let i = 0; i < fieldsAndValues?.length; i++) {
      if (fieldsAndValues[i]?.fieldValue != null && ( ((typeof(fieldsAndValues[i]?.fieldValue) == 'string') && (fieldsAndValues[i].fieldValue.trim() != "") )  || ((typeof(fieldsAndValues[i]?.fieldValue) == 'object') && fieldsAndValues[i]?.fieldValue?.length > 0))) {
        count = count + 1;
      }
    }
    if (count && (count / fieldsAndValues?.length) * 100) {
      return `${((count / fieldsAndValues?.length) * 100).toFixed()}%`;
    } else {
      return `00%`;
    }
  };

  //get Bl/No
  const getBlNo = () => {
    if (docObj?.fieldsAndValues) {
      let found = docObj?.fieldsAndValues.filter((item) => item.fieldName == 'bl_no');
      if (found[0]) {
        return found[0].fieldValue;
      }
    }
    return '';
  };

  const getRemainingFileds = (fieldsAndValues) => {
    let count = 0;
    for (let i = 0; i < fieldsAndValues?.length; i++) {
      if (fieldsAndValues[i]?.fieldValue != null && ( ((typeof(fieldsAndValues[i]?.fieldValue) == 'string') && (fieldsAndValues[i].fieldValue.trim() != "") )  || ((typeof(fieldsAndValues[i]?.fieldValue) == 'object') && fieldsAndValues[i]?.fieldValue?.length > 0))) {
        count = count + 1;
      }
    }
    return `${count + '/' + (fieldsAndValues?.length || 0)}`;
  };

  const setSelectedText = ({ selectedWord, pageIndex }) => {
    // console.log('this.state.selectedWord', selectedWord, pageIndex);
    if (docObj.extractedData) {
      let tempSelectedSentence = '';
      selectedWord.sort(function (a, b) {
        return a - b;
      });
      for (let e = 0; e < selectedWord.length; e++) {
        const aSelectedWord = selectedWord[e];
        tempSelectedSentence = tempSelectedSentence + docObj.extractedData.pages[pageIndex].words[aSelectedWord].content + ' ';
      }
      setSelectedSentence(tempSelectedSentence);
    }
  };

  let clearSelection = () => {
    setClearSelectedState(clearSelectedState + 1);
  };

  useEffect(() => {
    getData(id);
    // if (!collapsed) collapseSidebar();
    // return () => {
    //   collapseSidebar();
    // };
  }, []);

  const OnChangeClearCanvas = () => {
    setOnChangeClearCanvas(true)
  }

  
  const onClickDeleteButton = async () => {
    Swal.fire({
      title: `Are you sure ? `,
      icon: 'warning',
      text: 'Want to delete this Document?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      buttons: true,
    }).then(async (result) => {
      try {
        if (result.isConfirmed) {
           
            const response = await apiPUT(`/v1/documents/${id}`)
            if (response.status === 200) {
                Swal.fire({
                    title: "Success!",
              text: "Document Deleted successfully",
              icon: "success",
            });
            navigate(`/dashboard/document-list`)
        }
          else {
            Swal.fire({
              title: "Error!",
              text: response?.data?.data || "Something went wrong!",
              icon: "error",
            });
          }
        }
      } catch (error) {
        Swal.fire({
          title: 'Error !',
          text: error || "Something went wrong !",
          icon: 'error',
        });
      }
    });
}

  useEffect(() => {

    if (location.pathname === `/dashboard/document-list/delete/${id}`) {
        onClickDeleteButton()
    }

}, [location.pathname])


  return (
    <Sidebar.Pushable style={{ overflow: 'hidden' }}>
      <Sidebar
        style={{
          width: 800,
        }}
        as={'div'}
        animation="overlay"
        icon="labeled"
        direction="right"
        onHide={() => setVisible(false)}
        onHidden={() => navigate(`/dashboard/document-list/view/${id}`)}
        vertical={'vertical'}
        visible={visible}>
        {visible && <ReuploadDocument visible={visible} setVisible={setVisible} getAllData={getData} />}
      </Sidebar>
      <Sidebar
        style={{
          width: 900,
        }}
        as={'div'}
        animation="overlay"
        icon="labeled"
        direction="right"
        onHide={() => {
          setModalOpen(false);
        }}
        onHidden={() => navigate(`/dashboard/document-list/view/${id}`)}
        vertical={'vertical'}
        visible={modalOpen}>
        <StatusView 
        count={count}
        blNo={getBlNo()} docNo={docObj?.documentNo} modalOpen={setModalOpen} getData={getData} documentId={id} />
      </Sidebar>
      <Sidebar.Pusher dimmed={visible || modalOpen} className="fadeIn">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle">
              {sections.map((section, index) => (
                <span key={section.key}>
                  {section.to ? (
                    <Link to={section.to}>
                      <Breadcrumb.Section active={section.active}>{section.content}</Breadcrumb.Section>
                    </Link>
                  ) : (
                    <Breadcrumb.Section active={section.active}>{section.content}</Breadcrumb.Section>
                  )}
                  {index < sections.length - 1 && <Icon name="right angle" color="grey" size="small" style={{ marginTop: 6, margin: 4 }} />}
                </span>
              ))}
            </Breadcrumb>
            <div>
              <div className="header-text" style={{ fontSize: 17, fontWeight: 600 }}>
                {getBlNo()} | #{docObj?.seqId}
              </div>
              <div className="sub-text" style={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
                <div>{docObj?.documentNo}</div>
                <div>{docObj?.documentType}</div>
              </div>
            </div>
          </div>
          <div className="page-header-actions">
            {
                (user?.role != "documentation") &&  <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width:120
              }}
              >
                <strong>Assign To</strong>
                <p className="sub-text">
                   {docObj?.assignToUser ? docObj?.assignToUser?.name : "--"}
                    <i className="edit icon blue" onClick={()=>setOpenAssignToModal(true)} style={{marginLeft:"5px"}}></i>
                    {openAssignToModal && <AssignToModal setModalOpen={setOpenAssignToModal} modalOpen={openAssignToModal}defaultValue={docObj?.assignToUser?._id} documentId={docObj._id} getData={getData}/> }
                </p>
          </div>
            }
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: 100
              }}
            >
              <strong>Extraction</strong>
              <p className="sub-text">
                {getPercentage(docObj.fieldsAndValues)} | {getRemainingFileds(docObj.fieldsAndValues)}
              </p>
            </div>
            {
              (user?.role != "documentation") && <Button
                style={{ height: '3rem' }}
                onClick={() => {
                  navigate('/dashboard/document-list/reupload/' + id);
                  setVisible(true);
                }}>
                Reupload
              </Button>
            }
            <Button style={{ height: '3rem' }} onClick={extract} loading={extractLoading}>
              Extract
            </Button>
            <div>
              {docObj?.syncWithOtm ? (
                <Popup
                  content={moment(docObj?.lastSyncTime).format('DD/MM/YYYY HH:mm a')}
                  trigger={
                    <Button
                      style={{ height: '3rem', width: '154px' }}
                      onClick={() => {
                        setModalOpen(true);
                      }}
                      loading={pushLoading}
                      color={docObj?.syncWithOtm ? 'green' : 'blue'}
                    >
                      Sync Done
                    </Button>
                  }
                />
              ) : (
                <Button
                  style={{ height: '3rem', width: '154px' }}
                  onClick={pushToOTMClickHandler}
                  loading={pushLoading}
                  color={docObj?.syncWithOtm ? 'green' : 'blue'}
                >
                  Sync with ERP
                </Button>
              )}
            </div>
            {
              user?.role === "superAdmin" ?
                <Popup
                  content={'Raw'}
                  trigger={
                    <Button
                      onClick={() => {
                        setRawModal(!rawModal);
                      }}
                    >
                      R
                    </Button>
                  }
                /> : null}
          </div>
        </div>
        <div
          className="page-body"
          style={{
            justifyContent: 'space-between',
            height: '80vh',
            width: '100%',
            padding: 0,
            backgroundColor: '#efefef',
          }}>
          {docObj.documentUrl && (
            <div style={{ display: 'flex', width: '100%', 
            maxHeight: 'calc(100vh - 177px)', overflow: 'hidden' }}>
              <DocViewerCmp url={docObj.documentUrl} data={docObj} setSelectedText={setSelectedText}
                selectedSentence={selectedSentence}
                clearSelectedState={clearSelectedState} onChangeClearCanvas={onChangeClearCanvas}
              />
              {
                rawModal ? <RawModal rawModalData={rawModalData} /> :
                  <FieldsAndValuesCmp documentId={id} _docObj={docObj} selectedSentence={selectedSentence}
                    setDocObj={setDocObj} clearSelection={clearSelection} onChangeClearCanvas={OnChangeClearCanvas}
                    setOnChangeClearCanvas={setOnChangeClearCanvas} />}
            </div>
          )}
        </div>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

function FieldsAndValuesCmp({ _docObj, extractedData = {}, documentId, selectedSentence = '',
  setDocObj, data, clearSelection, onChangeClearCanvas, setOnChangeClearCanvas }) {
  const [docObj, _setDocObj] = useState(_docObj);
  const [search, setSearch] = useState('');
  const [selectedForEditing, setSelectedForEditing] = useState({});
  const [btnLoading, setButtonLoading] = useState(false);
  const [fieldsAndValues, setFieldsAndValues] = useState(docObj.fieldsAndValues);
  const [onFocusRow, setOnFocusRow] = useState({});
  const [sortData, setSortData] = useState();
  const [thisSelectedSentence, setThisSelectedSentence] = useState('');
  const [thisSelectedSentence2, setThisSelectedSentence2] = useState(selectedSentence);
  const [documentsData, setDocumentsData] = useState();
  const [docDropDownValue, setDocDropDownValue] = useState('')
  const [hideTextAreaCheck, setHideTextAreaCheck] = useState(false)
  const [dateValue, setDateValue] = useState(''); // Initialize with the date value

  useEffect(() => {
    setDateValue(selectedForEditing.fieldValue)
  }, [selectedForEditing.fieldValue])
  

  useEffect(() => {
    _setDocObj(_docObj);
    setFieldsAndValues(_docObj.fieldsAndValues);
  }, [_docObj]);

  useEffect(() => {
    if (search.trim()) {
      let searchLowerCase = search.toLowerCase();
      let filterData = docObj?.fieldsAndValues?.filter((item) => item.displayName.toLowerCase().includes(searchLowerCase) || item.fieldName.toLowerCase().includes(searchLowerCase));
      setFieldsAndValues([...filterData]);
      setSortData('');
    } else {
      setFieldsAndValues(docObj?.fieldsAndValues?.sort((a, b) => a?.field?.index - b?.field?.index));
      // setSortData("")
    }
  }, [search]);

  useEffect(() => {
    if (onFocusRow.selectedParam && selectedSentence != '') {
      let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
      if (clickedFieldIndex == 0 || clickedFieldIndex) {
        tempObj.fieldValue[clickedFieldIndex][onFocusRow.selectedParam] = selectedSentence;
      } else {
        for (let r = 0; r < tempObj?.fieldValue.length; r++) {
          const aFV = tempObj.fieldValue[r];
          if (aFV.itemId == onFocusRow.itemId) {
            tempObj.fieldValue[r][onFocusRow.selectedParam] = selectedSentence;
          }
        }
      }
      setSelectedForEditing(tempObj);
      console.log("selectFieldFor Editing tempObj",tempObj);

    }
    else {
      setThisSelectedSentence2(selectedSentence);
      if (selectedForEditing.fieldType != "master") {
        setThisSelectedSentence(selectedSentence);
      }

    }
  }, [selectedSentence]);



  const [editMode, setEditMode] = useState(false);
  const [clickedFieldIndex, setClickedFieldIndex] = useState();
//   const { fields, confidence } = docObj?.extractedData?.documents[0];


  useEffect(() => {
    if (!editMode) {
      setOnChangeClearCanvas(false)
    }
  }, [editMode])

  const options = [
    { key: 1, text: 'Name (A-Z)', value: 1 },
    { key: 2, text: 'Name (Z-A)', value: 2 },
    { key: 3, text: 'Confi. (1-9)', value: 3 },
    { key: 4, text: 'Confi. (9-1)', value: 4 },
    { key: 5, text: 'Sort. (1-9)', value: 5 },
    { key: 6, text: 'Sort. (9-1)', value: 6 },
  ];

  useEffect(() => {
   console.log("selectFieldFor Editing",selectedForEditing);
  }, [selectedForEditing])
  

  useEffect(() => {
    switch (sortData) {
      case 1: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => a.fieldName.localeCompare(b.fieldName));
        return setFieldsAndValues([...copy]);
      }
      case 2: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => b.fieldName.localeCompare(a.fieldName));
        return setFieldsAndValues([...copy]);
      }
      case 3: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => (a?.confidence || 10) - (b?.confidence || 10));
        return setFieldsAndValues([...copy]);
      }
      case 4: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => (b?.confidence || 0) - (a?.confidence || 0));
        return setFieldsAndValues([...copy]);
      }
      case 5: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => a?.field?.index - b?.field?.index);
        return setFieldsAndValues([...copy]);
      }
      case 6: {
        const copy = docObj?.fieldsAndValues?.sort((a, b) => b?.field?.index - a?.field?.index);
        return setFieldsAndValues([...copy]);
      }
      default:
        setFieldsAndValues(docObj?.fieldsAndValues?.sort((a, b) => a?.field?.index - b?.field?.index));
        break;
    }
  }, [sortData]);

//   if (!fields) return;

//   let keysArr = Object.keys(fields);
  //   const regex = new RegExp(`^${search}`, 'i');

  let editField = (aField) => {
    if (aField.displayName == 'Ship Unit Table') {
      if (aField.overrideValue && aField.overrideValue.length > 0) {
        aField.fieldValue = aField.overrideValue;
      }
      setSelectedForEditing(aField);
    } else {
      setSelectedForEditing(aField);
      if (aField.overrideValue) {
        setThisSelectedSentence(aField.overrideValue);
        setThisSelectedSentence2(aField.overrideValue);
        setDocDropDownValue(aField.overrideValue);
      }
    }

    setEditMode(true);
  };

  let backAndSave = async () => {
    let newData = {};

    if (selectedForEditing.displayName == 'Ship Unit Table') {
      newData = {
        overrideValue: selectedForEditing.fieldValue,
        fieldName: selectedForEditing.fieldName,
      };
    } else {
      if (thisSelectedSentence == '') {
        setThisSelectedSentence('')
      } else {
        setThisSelectedSentence(docDropDownValue);
      }
      newData = {
        overrideValue: thisSelectedSentence == "" ? "" : docDropDownValue ?
 docDropDownValue : thisSelectedSentence,
        fieldName: selectedForEditing.fieldName,
      };
      onChangeClearCanvas()
    }

    const url = `/v1/documents/update-field/${documentId}`;

    setButtonLoading(true);
    const response = await apiPOST(url, newData);
    setButtonLoading(false);
    if (response.status == '200') {
      alertSuccess('Field Updated');
    } else {
      alertError(response.message || response.data.data);
    }

    let fieldIndex = fieldsAndValues.findIndex((aField) => {
      return aField.fieldName == selectedForEditing.fieldName;
    });

    if (selectedForEditing.displayName == 'Ship Unit Table') {
      fieldsAndValues[fieldIndex].overrideValue = selectedForEditing.fieldValue;
    } else {
      fieldsAndValues[fieldIndex].overrideValue = thisSelectedSentence == "" ? "" : 
      thisSelectedSentence ? thisSelectedSentence : docDropDownValue;
    }

    // let newTempObj = JSON.parse(JSON.stringify(docObj));
    // newTempObj.fieldsAndValues = fieldsAndValues;
    // setDocObj(newTempObj);
    setEditMode(false);
    setOnFocusRow({});
    setSelectedForEditing({});
    setThisSelectedSentence('')
  };
  let closeEdit = () => {
    setEditMode(false);
    setOnFocusRow({});
    setSelectedForEditing({});
    setThisSelectedSentence('');
    setDocDropDownValue('')
    onChangeClearCanvas()
  };

  let updateTableField = (index, newValue, param, itemId) => {
    console.log('new value = ', index, newValue, param, itemId);
    let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
    tempObj.fieldValue[index][param] = newValue;
    // console.log(tempObj);
    setSelectedForEditing(tempObj);
  };

  let setTextareaTypeValue = (text) => {
    if (text?.target?.value) {
      setThisSelectedSentence(text?.target?.value);
    }
    else {
      setThisSelectedSentence(text);
    }

    if (text == undefined || text?.target?.value == '' || text == '') {
      setThisSelectedSentence('')
      setDocDropDownValue('')
      setThisSelectedSentence2("")
    }

  };

  useEffect(() => {
    setTextareaTypeValue(docDropDownValue);
  }, [docDropDownValue]);


  let onFieldFocus = (index, newValue, selectedParam, itemId) => {
    clearSelection();
    let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
    tempObj.fieldValue[index].index = index;
    tempObj.fieldValue[index].selectedParam = selectedParam;
    setOnFocusRow(tempObj.fieldValue[index]);

    // console.log('onFieldFocus = ', index, newValue, selectedParam);

    // console.log(tempObj);
    // setSelectedForEditing(tempObj);
  };

  let onFieldBlur = (index, newValue, param) => {
    //console.log('onFieldBlur = ', index, newValue, param);
    // let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
    // tempObj.fieldValue[index][param] = newValue;
    // console.log(tempObj);
    // setSelectedForEditing(tempObj);
  };

  let addNewRow = () => {
    let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
    tempObj.fieldValue.push({
      container: '',
      type: '',
      weight: '',
      uom: '',
      shipper: '',
      custom: '',
      liner: '',
    });
    setSelectedForEditing(tempObj);
  };

  //   let deleteRow = (itemId) => {
  //     console.log('delete itemId',itemId);
  //     console.log('delete onFocusRow.itemId',onFocusRow.itemId);
  //     if (onFocusRow.itemId == itemId) {
  //       setOnFocusRow({});
  //     }
  //     let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
  //     tempObj.fieldValue = tempObj.fieldValue.filter((item) => item.itemId !== itemId);
  //     setSelectedForEditing(tempObj);
  //   };

  let deleteRow = (index) => {
    let tempObj = JSON.parse(JSON.stringify(selectedForEditing));
    tempObj.fieldValue = tempObj.fieldValue.filter((item, i) => i !== index);
    setSelectedForEditing(tempObj);
  };

  const optionsUOM = [
    {
      key: 'KG',
      text: 'KG',
      value: 'KG',
      content: 'KG',
    },
    {
      key: 'LB',
      text: 'LB',
      value: 'LB',
      content: 'LB',
    },
  ];
  const optionsM_UOM = [
    {
      key: 'CU M',
      text: 'CU M',
      value: 'CU M',
      content: 'CU M',
    },
  ];

  //   if (search) keysArr = keysArr.filter((fName) => regex.test(fName));

  // console.log('keysArr',keysArr);
  /* Adding extra padding at bottom */
  // fieldsAndValues = [...fieldsAndValues];
  return editMode ? (
    <div className="fields-container">
      <div
        style={{
          height: 52,
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eee',
        }}>
        <Button icon labelPosition="left" onClick={backAndSave} loading={btnLoading}>
          Save & Back
          <Icon name="left arrow" />
        </Button>

        <Button animated="fade" onClick={closeEdit}>
          <Button.Content visible>Close</Button.Content>
          <Button.Content hidden>
            <Icon name="close" />
          </Button.Content>
        </Button>
      </div>
      <div>
        <table className="ui definition table compact" compact style={{ marginTop: 0, borderRadius: 0 }}>
          <tbody>
            <tr>
              <td className="wide column" style={{ width: 160 }}>
                Field Name
              </td>
              <td className="wide column">{selectedForEditing.displayName}</td>
            </tr>
            {selectedForEditing.displayName !== 'Ship Unit Table' ? (
              <tr>
                <td className="wide column" style={{ width: 170 }}>
                  Original Value
                </td>
                <td className="wide column">{selectedForEditing.fieldValue}</td>
              </tr>
            ) : (
              ''
            )}
            <tr>
              <td className="wide column" style={{ width: 170 }}>
                New Value
              </td>
              <td className="wide column" colSpan={2}>
                {selectedForEditing.displayName == 'Ship Unit Table' ? (
                  <div>
                    <Table compact>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell></Table.HeaderCell>
                          <Table.HeaderCell>Container</Table.HeaderCell>
                          <Table.HeaderCell>Details</Table.HeaderCell>
                          <Table.HeaderCell></Table.HeaderCell>
                          <Table.HeaderCell>Seal</Table.HeaderCell>
                          <Table.HeaderCell>Package Details</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {selectedForEditing.fieldValue?.length ? (
                          selectedForEditing.fieldValue?.map((aRow, index) => {
                            return (
                              <Table.Row>
                                <Table.Cell>
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      color: '#f44336',
                                      cursor: 'pointer',
                                    }}>
                                    <Icon
                                      name="delete"
                                      onClick={() => {
                                        // deleteRow(aRow.itemId);
                                        deleteRow(index);
                                      }}
                                    />
                                  </span>
                                </Table.Cell>
                                <Table.Cell>
                                  <div style={{ width: 150 }}>
                                    <div >
                                      <label>
                                        <p>Number :</p>
                                      </label>
                                      <input
                                        style={{
                                          width: 130,
                                          outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'container' && index === clickedFieldIndex ? '2px solid #9c27b0' : 'none',
                                          border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'container' && index === clickedFieldIndex ? '1px solid #9c27b0' : '1px solid black',
                                          padding: '4px',
                                          borderRadius: 3,
                                          height: 37
                                        }}
                                        placeholder="Container Number"
                                        onFocus={(e) => {
                                          setClickedFieldIndex(index);
                                          onFieldFocus(index, e, 'container', aRow.itemId);
                                        }}
                                        onBlur={(e) => {
                                          setClickedFieldIndex(index);
                                          onFieldBlur(index, e, 'container', aRow.itemId);
                                        }}
                                        onChange={(e) => {
                                          // setSelectedForEditing({...selectedForEditing,fieldValue[index]?.container = thisSelectedSentence})
                                          updateTableField(index, e.target.value, 'container', aRow.itemId);
                                        }}
                                        value={selectedForEditing.fieldValue[index].container}
                                      />
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                      <label>
                                        <p>container Type :</p>
                                      </label>
                                      <ContainerTypeDropdown
                                        dropDownOptions={selectedForEditing?.master_container_type}
                                        onFocusRow={onFocusRow}
                                        aRow={aRow}
                                        index={index}
                                        clickedFieldIndex={clickedFieldIndex}
                                        onFocus={(e) => {
                                          setClickedFieldIndex(index);
                                          onFieldFocus(index, e, 'type', aRow.itemId);
                                        }}
                                        onBlur={(e) => {
                                          setClickedFieldIndex(index);
                                          onFieldBlur(index, e, 'type', aRow.itemId);
                                        }}
                                        dafaultValue={selectedForEditing.fieldValue[index].type}
                                        selectedSentence={selectedSentence}
                                        updateTableField={updateTableField}
                                      // handleChange={(e, { value }) => updateTableField(index, value, 'type', aRow.itemId)}
                                      />
                                    </div>
                                  </div>
                                </Table.Cell>
                                <Table.Cell>
                                  <div>
                                    <label>
                                      <p>Weight : </p>
                                    </label>
                                    <input
                                      placeholder="Enter weight"
                                      style={{
                                        width: 100,
                                        outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'weight' && index == clickedFieldIndex ? '2px solid #9c27b0' : 'none',
                                        border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'weight' && index == clickedFieldIndex ? '1px solid #9c27b0' : '1px solid black',
                                        padding: 4,
                                        marginBottom: 6,
                                        borderRadius: 3,
                                        height: 37
                                      }}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'weight', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'weight', aRow.itemId);
                                      }}
                                      onChange={(e) => updateTableField(index, e.target.value, 'weight', aRow.itemId)}
                                      value={selectedForEditing.fieldValue[index].weight}
                                    />
                                  </div>

                                  <div>
                                    <label>
                                      <p>UOM :</p>{' '}
                                    </label>
                                    <Dropdown
                                      fluid
                                      selection
                                      placeholder="Select"
                                      style={{
                                        width: 100,
                                        outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'uom' && index == clickedFieldIndex ? '2px solid #9c27b0' : 'none',
                                        border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'uom' && index == clickedFieldIndex ? '1px solid #9c27b0' : '1px solid black',
                                        // padding: '3px',
                                        borderRadius: 3,
                                      }}
                                      clearable={true}
                                      options={optionsUOM}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'uom', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'uom', aRow.itemId);
                                      }}
                                      onChange={(e, { value }) => updateTableField(index, value, 'uom', aRow.itemId)}
                                      defaultValue={selectedForEditing.fieldValue[index].uom}
                                    />
                                  </div>
                                </Table.Cell>
                                <Table.Cell>
                                  <div>
                                    <label>
                                      <p>Measurement : </p>
                                    </label>
                                    <input
                                      placeholder="Enter measurement"
                                      style={{
                                        width: 100,
                                        outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'measurement' && index == clickedFieldIndex ? '2px solid #9c27b0' : 'none',
                                        border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'measurement' && index == clickedFieldIndex ? '1px solid #9c27b0' : '1px solid black',
                                        padding: 4,
                                        marginBottom: 6,
                                        borderRadius: 3,
                                        height: 37
                                      }}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'measurement', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'measurement', aRow.itemId);
                                      }}
                                      onChange={(e) => updateTableField(index, e.target.value, 'measurement', aRow.itemId)}
                                      value={selectedForEditing.fieldValue[index].measurement}
                                    />
                                  </div>

                                  <div>
                                    <label>
                                      <p>M_UOM :</p>{' '}
                                    </label>
                                    <Dropdown
                                      fluid
                                      selection
                                      placeholder="Select"
                                      style={{
                                        width: 100,
                                        outline: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'm_uom' && index == clickedFieldIndex ? '2px solid #9c27b0' : 'none',
                                        border: onFocusRow.itemId == aRow.itemId && onFocusRow.selectedParam == 'm_uom' && index == clickedFieldIndex ? '1px solid #9c27b0' : '1px solid black',
                                        // padding: '3px',
                                        borderRadius: 3,
                                      }}
                                      clearable={true}
                                      options={optionsM_UOM}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'm_uom', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'm_uom', aRow.itemId);
                                      }}
                                      onChange={(e, { value }) => updateTableField(index, value, 'm_uom', aRow.itemId)}
                                      defaultValue={selectedForEditing.fieldValue[index].m_uom}
                                    />
                                  </div>
                                </Table.Cell>
                                <Table.Cell>
                                  <SealNumberCompTypeDropdown
                                    onFocusRow={onFocusRow}
                                    options={options[0]}
                                    aRow={aRow}
                                    selectedForEditing={selectedForEditing && selectedForEditing}
                                    index={index}
                                    onFieldFocus={onFieldFocus}
                                    onFieldBlur={onFieldBlur}
                                    selectedSentence={selectedSentence}
                                    updateTableField={updateTableField}
                                    setClickedFieldIndex={setClickedFieldIndex}
                                  // clickedFieldIndex={clickedFieldIndex}
                                  //  handledata={(val)=>updateTableField(index, val, 'sealData', aRow.itemId)}
                                  />
                                </Table.Cell>
                                <Table.Cell>
                                  <div>
                                    <label>
                                      <p>Package Type :</p>
                                    </label>
                                    <PackageTypeDropdown
                                      onFocusRow={onFocusRow}
                                      aRow={aRow}
                                      index={index}
                                      clickedFieldIndex={clickedFieldIndex}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'packageType', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'packageType', aRow.itemId);
                                      }}
                                      dafaultValue={selectedForEditing.fieldValue[index].packageType}
                                      selectedSentence={selectedSentence}
                                      updateTableField={updateTableField}
                                    />
                                  </div>
                                  <div>
                                    <label>
                                      <p>Item :</p>
                                    </label>
                                    <ItemMasterDropdown
                                      onFocusRow={onFocusRow}
                                      aRow={aRow}
                                      index={index}
                                      clickedFieldIndex={clickedFieldIndex}
                                      onFocus={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldFocus(index, e, 'item', aRow.itemId);
                                      }}
                                      onBlur={(e) => {
                                        setClickedFieldIndex(index);
                                        onFieldBlur(index, e, 'item', aRow.itemId);
                                      }}
                                      dafaultValue={selectedForEditing.fieldValue[index].item}
                                      selectedSentence={selectedSentence}
                                      updateTableField={updateTableField}
                                    />
                                  </div>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })
                        ) : (
                          <div>nothing found</div>
                        )}
                      </Table.Body>
                    </Table>
                    <Button animated="fade" onClick={addNewRow}>
                      <Button.Content visible>Add New Row</Button.Content>
                      <Button.Content hidden>
                        <Icon name="add" />
                      </Button.Content>
                    </Button>
                  </div>
                ) : (
                  <Form>
                    {
                      selectedForEditing && selectedForEditing.fieldType == "master" && (
                        <div style={{ marginBottom: 15 }}>
                          <RemoteDocumentDropdown
                            label={"Port List"}
                            value={docDropDownValue}
                            fieldsObj={selectedForEditing.field}
                            setValue={setDocDropDownValue}
                            selectedForEditing={selectedForEditing.fieldValue}
                            thisSelectedSentenceText={thisSelectedSentence2}
                            setThisSelectedSentenceTex={setThisSelectedSentence}
                            setDocumentsData={setDocumentsData}
                            setHideTextAreaCheck={setHideTextAreaCheck}
                          />
                        </div>
                      )
                    }
                    {
                      hideTextAreaCheck ? null :
                      selectedForEditing.fieldType == "date" ?
                            <>
                              <input type="date" id="myDateInput"
                                value={docDropDownValue}
                                onChange={(e) => { setDocDropDownValue(e.target.value) }}
                              />
                            </>
                      :
                         <Form.TextArea
                          rows={10}
                          placeholder="Select form the PDF or type your own..."
                          onChange={(text) => {
                            setTextareaTypeValue(text);
                          }}
                          readOnly={selectedForEditing.fieldType == "master" ? true : false}
                          value={thisSelectedSentence}
                        />
                    }
                  </Form>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="fields-container" style={{display:'flex', flexDirection : "column"}}>
        <div style={{ display: 'flex', height: 56, paddingRight: 10 }}>
          <Input autoComplete="new-password" placeholder="Search Field Name" type="text" style={{ width: '96%', margin: 9 }} onChange={(e, { value }) => setSearch(e.target.value)} value={search} />
          <div style={{ padding: '10px 0', marginTop: -1 }}>
            <Dropdown
              placeholder="Sort By "
              clearable
              options={options}
              selection
              value={sortData}
              onChange={(e, data) => {
                setSortData(data.value);
                setSearch('');
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table className="ui definition table compact" compact style={{
            marginTop: 0,
            borderRadius: 0, marginBottom: 40
          }}>
            <tbody>
              {fieldsAndValues?.length ? (
                fieldsAndValues.map((aField, idx) => {
                  return aField['displayName'] == 'Ship Unit Table' ? (
                    <tr>
                      <td className="two wide column">
                        {aField?.displayName}
                        {aField?.overrideValue?.length ? '*' : null}
                      </td>
                      <td style={{ width: 15, cursor: 'pointer' }} onClick={() => editField(aField)}>
                        <Icon name="edit" />
                      </td>
                      <td>
                        <Table compact>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>Container</Table.HeaderCell>
                              <Table.HeaderCell>Weight/UOM</Table.HeaderCell>
                              <Table.HeaderCell className="ten wide">Seal Details</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>

                          <Table.Body>
                            {aField?.overrideValue
                              ? aField.overrideValue?.map((aRow) => {
                                return (
                                  <Table.Row>
                                    <Table.Cell>
                                      {aRow.container} {aRow.type}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {aRow.weight} {aRow.uom}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {aRow.shipper && `Shipper Seal: \n ${aRow.shipper}`}
                                      {aRow.liner && `\nLiner Seal: \n${aRow.liner}`}
                                      {aRow.custom && `\nCustom Seal: \n${aRow.custom}`}
                                    </Table.Cell>
                                  </Table.Row>
                                );
                              })
                              : aField.fieldValue?.map((aRow) => {
                                return (
                                  <Table.Row>
                                    <Table.Cell>
                                      {aRow.container} {aRow.type}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {aRow.weight} {aRow.uom}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {aRow.shipper && `Shipper Seal: \n${aRow.shipper}`}
                                      {aRow.liner && `\nLiner Seal: \n${aRow.liner}`}
                                      {aRow.custom && `\nCustom Seal: \n${aRow.custom}`}
                                    </Table.Cell>
                                  </Table.Row>
                                );
                              })}
                          </Table.Body>
                        </Table>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="two wide column" style={{ minWidth: 170 }}>
                        {aField?.displayName}
                        {aField?.overrideValue ? '*' : null}
                        <div
                          style={{
                            fontSize: 'smaller',
                            fontWeight: 400,
                          }}>
                          {' '}
                          {aField.displayName === 'Description' ? (aField.overrideValue ? 'Char Count: ' + aField.overrideValue.length : aField.fieldValue ? 'Char Count: ' + aField.fieldValue.toString().length : null) : null}
                          <p>{aField.confidence ? `(Confi. : ${(aField.confidence * 100).toFixed(2)}%)` : ''}</p>
                        </div>
                      </td>
                      <td style={{ width: 15, cursor: 'pointer' }} onClick={() => editField(aField)}>
                        <Icon name="edit" />
                      </td>
                      {/* <td>{aField?.overrideValue ? aField?.overrideValue : aField?.fieldValue?.toString()}</td> */}
                      <td>{aField?.overrideValue ?
                        aField?.field?.fieldType == "date" ?
                          moment(aField?.overrideValue).format(aField.field.dateFormat)
                          : aField?.overrideValue
                        : aField?.field?.fieldType == "date" ?
                          moment(aField?.fieldValue).format(aField.field.dateFormat)
                          : aField?.fieldValue?.toString()
                      }
                      </td>
                    </tr>
                  );
                })
              ) : (
                <div style={{ marginLeft: 8 }}>No matching fields found</div>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}

class DocViewerCmp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNumber: 1,
      totalPages: 1,
      pageWidth: 700,
      data: props.data,
      selectedWord: [],
      multiplier: 1,
      initialClientX: 0,
      timerStarted: false,
      timerObj: undefined,
      selectBoxState: false,
      selectWordState: true,
      scale: 1
    };
    this.file = {
      url: props.url,
    };
    this.dragging = false;
    this.boxData = {};
    this.lastSelectedIndex;
    this.ref = React.createRef();
    this.imgData;
  }

  clearCanvas = () => {
    const canvas = this.ref;
    const context = canvas.getContext('2d');
    this.setState({ selectedWord: [] });
    context.putImageData(this.imgData, 0, 0);
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedWord.length !== prevState.selectedWord.length) {
      this.renderSelectedBoxes();
      this.props.setSelectedText({
        selectedWord: this.state.selectedWord,
        pageIndex: this.state.pageNumber - 1,
      });
    }

    if (this.props.clearSelectedState !== prevProps.clearSelectedState) {
      this.clearCanvas();
    }
    if (this.props.onChangeClearCanvas && this.props.selectedSentence) {
      this.clearCanvas();
    }
  }


  renderSelectedBoxes = () => {
    const canvas = this.ref;
    const context = canvas.getContext('2d');
    context.putImageData(this.imgData, 0, 0);

    for (let p = 0; p < this.state.selectedWord.length; p++) {
      const aSelectedWord = this.state.data.extractedData.pages[this.state.pageNumber - 1].words[this.state.selectedWord[p]];
      context.lineWidth = 2;
      context.strokeStyle = '#f44336';
      context.beginPath();
      context.moveTo(aSelectedWord.polygon[0].x * this.state.multiplier, aSelectedWord.polygon[0].y * this.state.multiplier);
      context.lineTo(aSelectedWord.polygon[1].x * this.state.multiplier, aSelectedWord.polygon[1].y * this.state.multiplier);
      context.lineTo(aSelectedWord.polygon[2].x * this.state.multiplier, aSelectedWord.polygon[2].y * this.state.multiplier);
      context.lineTo(aSelectedWord.polygon[3].x * this.state.multiplier, aSelectedWord.polygon[3].y * this.state.multiplier);

      context.closePath();
      context.stroke();
    }
  };

  dragStartFn = (event) => {
    this.dragging = true;
    if (this.state.selectBoxState) {
      this.boxData = {
        start: this.getCanvasCoordinates(event),
      };
    }
  };

  getCanvasCoordinates = (event) => {
    const canvas = this.ref;
    var x = event.clientX - canvas.getBoundingClientRect().left,
      y = event.clientY - canvas.getBoundingClientRect().top;
    return { x: x, y: y };
  };

  pointIsInPoly = (p, polygon) => {
    const canvas = this.ref;
    if (p.x > (polygon[0].x * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) && p.x < (polygon[2].x * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) && p.y > (polygon[0].y * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) && p.y < (polygon[2].y * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth)) {
      return true;
    } else {
      return false;
    }
  };

  wordIsInRectangle = (aWordPolygon, rec) => {
    const canvas = this.ref;

    if ((aWordPolygon[0].x * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) > rec.x1 && (aWordPolygon[0].x * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) < rec.x2 && (aWordPolygon[0].y * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) > rec.y1 && (aWordPolygon[0].y * this.state.multiplier) / (canvas.width / canvas.parentElement.clientWidth) < rec.y2) {
      return true;
    } else {
      return false;
    }
  };

  renderAllBoxes = (multiplier) => {
    const canvas = this.ref;
    const context = canvas.getContext('2d');

    if (this.state.data && this.state.data.extractedData && this.state.data.extractedData.pages[this.state.pageNumber - 1]) {
      let aPage = this.state.data.extractedData.pages[this.state.pageNumber - 1];

      for (let w = 0; w < aPage.words.length; w++) {
        const aWord = aPage.words[w];
        context.lineWidth = 1;
        context.strokeStyle = '#8eb3ff';
        context.beginPath();
        context.moveTo(aWord.polygon[0].x * multiplier, aWord.polygon[0].y * multiplier);
        context.lineTo(aWord.polygon[1].x * multiplier, aWord.polygon[1].y * multiplier);
        context.lineTo(aWord.polygon[2].x * multiplier, aWord.polygon[2].y * multiplier);
        context.lineTo(aWord.polygon[3].x * multiplier, aWord.polygon[3].y * multiplier);
        context.closePath();
        context.stroke();
      }
    }
  };

  clickFn = (event) => {
    var position = this.getCanvasCoordinates(event);

    if (this.state.selectWordState) {
      if (this.state.data && this.state.data.extractedData && this.state.data.extractedData.pages[this.state.pageNumber - 1]) {
        let aPage = this.state.data.extractedData.pages[this.state.pageNumber - 1];
        for (let w = 0; w < aPage.words.length; w++) {
          const aWord = aPage.words[w];
          if (this.pointIsInPoly(position, aWord.polygon)) {
            if (this.lastSelectedIndex != w) {
              this.lastSelectedIndex = w;
            } else {
              break;
            }

            let isWordSelected = false;

            for (let a = 0; a < this.state.selectedWord.length; a++) {
              const aSelectedWord = this.state.selectedWord[a];
              if (aSelectedWord === w) {
                isWordSelected = true;

                let tempSelectedArr = JSON.parse(JSON.stringify(this.state.selectedWord));
                tempSelectedArr.splice(a, 1);
                this.setState({
                  selectedWord: tempSelectedArr,
                });
                break;
              }
            }
            if (!isWordSelected) {
              this.setState({
                selectedWord: [...this.state.selectedWord, w],
              });
            }
            break;
          }
        }
      }
      this.lastSelectedIndex = undefined;
    }
  };

  debounceEvent = (event) => {
    if (this.timerStarted) {
      clearTimeout(this.timerObj);
      this.timerStarted = false;
    }
    this.timerObj = setTimeout(
      (_event) => {
        this.dragFn(_event);
      },
      1,
      event
    );
    this.timerStarted = true;
  };

  dragFn = (event) => {
    var position;
    if (this.dragging === true) {
      // console.log('event executed');
      position = this.getCanvasCoordinates(event);
      if (this.state.selectBoxState) {
        const canvas = this.ref;
        const context = canvas.getContext('2d');
        this.renderSelectedBoxes();
        context.lineWidth = 1;
        context.strokeStyle = '#21ba45';
        console.log(this.state.multiplier);
        context.strokeRect(this.boxData.start.x * (canvas.width / canvas.parentElement.clientWidth), this.boxData.start.y * (canvas.width / canvas.parentElement.clientWidth), (position.x - this.boxData.start.x) * (canvas.width / canvas.parentElement.clientWidth), (position.y - this.boxData.start.y) * (canvas.width / canvas.parentElement.clientWidth));

        if (this.state.data && this.state.data.extractedData && this.state.data.extractedData.pages[this.state.pageNumber - 1]) {
          let aPage = this.state.data.extractedData.pages[this.state.pageNumber - 1];
          let finalSelectedWords = [...this.state.selectedWord];
          for (let w = 0; w < aPage.words.length; w++) {
            const aWord = aPage.words[w];
            if (
              this.wordIsInRectangle(aWord.polygon, {
                x1: this.boxData.start.x,
                y1: this.boxData.start.y,
                x2: position.x,
                y2: position.y,
              })
            ) {
              // console.log('Found');
              if (!finalSelectedWords.includes(w)) finalSelectedWords.push(w);
            }
          }
          this.setState({
            selectedWord: [...finalSelectedWords],
          });
          // console.log('Added');
        }
      } else {
        if (this.state.data && this.state.data.extractedData && this.state.data.extractedData.pages[this.state.pageNumber - 1]) {
          let aPage = this.state.data.extractedData.pages[this.state.pageNumber - 1];
          for (let w = 0; w < aPage.words.length; w++) {
            const aWord = aPage.words[w];
            if (this.pointIsInPoly(position, aWord.polygon)) {
              if (this.lastSelectedIndex != w) {
                this.lastSelectedIndex = w;
              } else {
                break;
              }

              let isWordSelected = false;

              for (let a = 0; a < this.state.selectedWord.length; a++) {
                const aSelectedWord = this.state.selectedWord[a];
                if (aSelectedWord === w) {
                  isWordSelected = true;

                  let tempSelectedArr = JSON.parse(JSON.stringify(this.state.selectedWord));
                  tempSelectedArr.splice(a, 1);
                  this.setState({
                    selectedWord: tempSelectedArr,
                  });
                  break;
                }
              }
              if (!isWordSelected) {
                this.setState({
                  selectedWord: [...this.state.selectedWord, w],
                });
              }
              break;
            }
          }
        }
      }
    }
  };

  dragStopFn = () => {
    this.dragging = false;
    this.renderSelectedBoxes();
  };

  onRenderSuccess = () => {
    const canvas = this.ref;
    const context = canvas.getContext('2d');

    let multiplier = (canvas.parentElement.clientWidth / this.state.data.extractedData.pages[this.state.pageNumber - 1].width) * (canvas.width / canvas.parentElement.clientWidth);

    this.setState({
      multiplier: multiplier,
    });

    this.renderAllBoxes(multiplier);

    canvas.addEventListener('mousedown', this.dragStartFn, false);
    canvas.addEventListener('mousemove', this.debounceEvent, false);
    canvas.addEventListener('mouseup', this.dragStopFn, false);
    canvas.addEventListener('click', this.clickFn, false);
    this.imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  };

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({
      totalPages: numPages,
    });
  };

  dragStart = (event, a, b) => {
    this.setState({ initialClientX: event.clientX });
  };

  draggingResize = (event, a, b) => {
    if (event.clientX != 0) {
      let diffX = event.clientX - this.state.initialClientX;
      this.setState({
        pageWidth: this.state.pageWidth + diffX,
        initialClientX: event.clientX,
      });
    }
  };

  dragEndResize = () => {
    this.renderSelectedBoxes();
  };

  handleToolChange = (tool) => {
    // console.log('Tool : ', tool);
    if (tool == 'box') {
      this.setState({ selectWordState: false, selectBoxState: true });
    }
    if (tool == 'word') {
      this.setState({ selectWordState: true, selectBoxState: false });
    }
  };

  copySelected = () => {
    if (this.state.data.extractedData) {
      let tempSelectedSentence = '';
      let _selectedWord = this.state.selectedWord;
      _selectedWord.sort();
      for (let e = 0; e < _selectedWord.length; e++) {
        const aSelectedWord = _selectedWord[e];
        tempSelectedSentence = tempSelectedSentence + this.state.data.extractedData.pages[this.state.pageNumber - 1].words[aSelectedWord].content + ' ';
      }
      navigator.clipboard.writeText(tempSelectedSentence);
    }
  };

  zoomIn = () => {
    this.setState({
      scale: this.state.scale + 0.2
    })
  }
  zoomOut = () => {
    this.setState({
      scale: this.state.scale - 0.2,
    });

  }
  resetZoom = () => {
    this.setState({
      scale: 1,
    });
  }

  render() {
    return (
      <div style={{ display: 'flex', position: 'relative', minWidth: this.state.pageWidth + 10 }}>
        <div style={{ marginLeft: 5, overflow: "auto", maxWidth: this.state.pageWidth + 30, paddingTop: 46 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px',
              position: "absolute",
              top: 0,
              zIndex: 1,
              width: 'calc(100% - 20px)',
              background: "white",
              borderBottom: "1px solid #efefef"
            }}>
            <span style={{ marginLeft: 0 }}>Total Pages : {this.state.totalPages}</span>
            <Pagination
              boundaryRange={0}
              defaultActivePage={1}
              ellipsisItem={null}
              firstItem={null}
              lastItem={null}
              siblingRange={1}
              size="mini"
              activePage={this.state.pageNumber}
              onPageChange={(e, { activePage }) => {
                this.setState({
                  pageNumber: activePage,
                  selectedWord: [],
                });
              }}
              totalPages={this.state.totalPages}
            />
            
            <Button.Group>

            <Popup
                content="View PDF"
                trigger={
                  <Button icon onClick={()=>window.open(this.file.url, '_blank')}>
                    <Icon name="eye" />
                  </Button>
                }
              />
              
              <Popup
                content="Zoom In"
                trigger={
                  <Button icon onClick={this.zoomIn}>
                    <Icon name="zoom-in" />
                  </Button>
                }
              />

              <Popup
                content="Zoom Out"
                trigger={
                  <Button icon onClick={this.zoomOut}>
                    <Icon name="zoom-out" />
                  </Button>
                }
              />
              <Popup
                content="Reset"
                trigger={
                  <Button icon onClick={this.resetZoom}>
                    <Icon name="repeat" />
                  </Button>
                }
              />
              <Popup
                content="Draw a region to select words"
                trigger={
                  <Button
                    icon
                    toggle
                    active={this.state.selectBoxState}
                    onClick={() => {
                      this.handleToolChange('box');
                    }}>
                    <Icon name="crop" />
                  </Button>
                }
              />

              <Popup
                content="Click on word or drag over them to select"
                trigger={
                  <Button
                    icon
                    toggle
                    active={this.state.selectWordState}
                    onClick={() => {
                      this.handleToolChange('word');
                    }}>
                    <Icon name="mouse pointer" />
                  </Button>
                }
              />

              <Popup
                content="Copy selected words to Clipboard"
                trigger={
                  <Button icon onClick={this.copySelected}>
                    <Icon name="copy outline" />
                  </Button>
                }
              />

              <Popup
                content="Clear selection"
                trigger={
                  <Button icon onClick={this.clearCanvas}>
                    <Icon name="trash alternate outline" />
                  </Button>
                }
              />
            </Button.Group>
          </div>
          <div style={{ display: 'flex', height: '100%' }}>
            <Document file={this.file} onLoadSuccess={this.onDocumentLoadSuccess}>
              <Page
                pageNumber={this.state.pageNumber}
                scale={this.state.scale}
                width={this.state.pageWidth}
                canvasRef={(ref) => {
                  this.ref = ref;
                }}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onRenderSuccess={() => {
                  this.onRenderSuccess();
                }}
              />
            </Document>
          </div>
        </div>
        <div
          style={{
            width: 4,
            cursor: 'col-resize',
            height: '100%',
            background: 'transparent',
          }}
          draggable={true}
          onDragStart={(e) => this.dragStart(e)}
          onDrag={(e) => this.draggingResize(e)}
          onDragEnd={() => {
            this.dragEndResize();
          }}>
          {' '}
        </div>

        <div style={{ position: 'absolute', bottom: 15, left: 0 }}></div>
      </div>
    );
  }
}


function RawModal({ rawModalData }) { 
  const renderValue = (value) => {
    if (value.kind === "string") {
      return value.value;
    } else if (value.values) {
      return value.values.map((item, index) => (
        <div key={index}>
          <Table celled basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Keys</Table.HeaderCell>
                <Table.HeaderCell>Values</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.entries(item.properties).map(([key, value]) => (
                <Table.Row key={key}>
                  <Table.Cell>{key}</Table.Cell>
                  <Table.Cell>{value.value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ));
    }
  };

  return (
    <div className="fields-container">
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Fields</Table.HeaderCell>
            <Table.HeaderCell>Values</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(rawModalData).map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>{renderValue(value)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div style={{ height: 20 }}></div>
    </div>
  );
}


