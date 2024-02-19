import React, { useContext } from 'react';
import { Link, json, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Grid, Header, Divider, Icon, Input, Label, Search, Form, Modal, Flag, Pagination, Container, Sidebar, Table, Dropdown, List, Popup, Tab } from 'semantic-ui-react';
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
import toast, { Toaster } from 'react-hot-toast';
import { Scrollbars } from 'react-custom-scrollbars-2';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { ASSIGN_TO, DELETE_DOCUMENT, EXTRACTION, REUPLOAD_PDF, SYNC_WITH_ERP, VIEW_RAW, hasAccess } from '../../utils/accessHelper';

import {write, utils} from 'xlsx';
import FileSaver from 'file-saver';

export default function ViewDocument() {
    let { id } = useParams();

    const [docObj, setDocObj] = useState({});
    const [visible, setVisible] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);
    const [selectedSentence, setSelectedSentence] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [rawModal, setRawModal] = useState(false)
    const [rawTableModal, setRawTableModal] = useState(false)
    const [rawModalData, setRawModalData] = useState({})
    const [rawTableModalData, setRawTableModalData] = useState({})
    const [onChangeClearCanvas, setOnChangeClearCanvas] = useState(false)
    const [count, setCount] = useState(0)
    let { user } = useContext(AuthContext);
    const [extractLoading, setExtractLoading] = useState(false);
    const [openAssignToModal, setOpenAssignToModal] = useState(false)
    const [clearSelectedState, setClearSelectedState] = useState(0);
    const [access, setAccess] = useState(false)
    const navigate = useNavigate();

    const getData = async (id) => {
        try {
            let data = await apiGET('/v1/documents/' + id);
            if (data.status == '200') {
                const doc = data.data.data;
                setDocObj(doc);

                // console.log("DOCOBJECT::::::::::",doc.domainName);
                if (doc?.extractedData?.documents) {
                    setRawModalData(doc?.extractedData?.documents[0]?.fields)
                    setRawTableModalData(doc?.extractedData?.tables)
                }
            } else if (data.status == "401") {
                Swal.fire({
                    title: "Error !",
                    text: data?.data?.data || "Document Not Found",
                    icon: "error",
                });
                navigate("/dashboard/document-list")
            } else {
                Swal.fire({
                    title: "Error !",
                    text: "Document Not Found",
                    icon: "error",
                });
                navigate("/dashboard/document-list")
            }
        } catch (error) {
            console.log('error', error);
            Swal.fire({
                title: "Error !",
                text: error,
                icon: "error",
            });
        }
    };

    const pushToOTMClickHandler = async () => {
        if (pushLoading) return;

        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'You want to push this document with API ?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const toastId = toast.loading('Processing, Please wait');
                    setTimeout(() => {
                        toast.dismiss(toastId);
                        alertSuccess("API Synchronization Started.");
                    }, 1000);
                    
                }

            } catch (error) {
                Swal.fire({
                    title: 'Error !',
                    text: error || "Something went wrong !",
                    icon: 'error',
                });
            }
        });
    };

    const extract = async () => {


        if (pushLoading) return;

        const toastId = toast.loading('Extracting Fields, Please wait');

        setExtractLoading(true);
        let res = await apiPOST('/v1/documents/processExtractedFields/' + id);
        // console.log('extractLoading ::', res);
        setExtractLoading(false);

        toast.dismiss(toastId);


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
            if (fieldsAndValues[i]?.fieldValue != null && (((typeof (fieldsAndValues[i]?.fieldValue) == 'string') && (fieldsAndValues[i].fieldValue.trim() != "")) || ((typeof (fieldsAndValues[i]?.fieldValue) == 'object') && fieldsAndValues[i]?.fieldValue?.length > 0))) {
                count = count + 1;
            }
        }
        if (count && (count / fieldsAndValues?.length) * 100) {
            return `${((count / fieldsAndValues?.length) * 100).toFixed()}%`;
        } else {
            return `00%`;
        }
    };

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
            if (fieldsAndValues[i]?.fieldValue != null && (((typeof (fieldsAndValues[i]?.fieldValue) == 'string') && (fieldsAndValues[i].fieldValue.trim() != "")) || ((typeof (fieldsAndValues[i]?.fieldValue) == 'object') && fieldsAndValues[i]?.fieldValue?.length > 0))) {
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

    const onClickDeleteRequestButton = async () => {
        Swal.fire({
            title: `Are you sure ? `,
            icon: 'warning',
            html: `Do you want to send a request to delete this document?<br> If yes, it will be sent for approvals to the respective domain.`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const toastId = toast.loading('Sending Request, Please wait');
                    const response = await apiGET(`/v1/documents/deletebymail/${id}?domainName=${docObj.domainName}`)
                    console.log("response.code", response);
                    if (response.data.code == 200) {
                        Swal.fire({
                            title: "Success!",
                            text: response?.data?.data?.message,
                            icon: "success",
                        });
                        toast.dismiss(toastId);
                        navigate("/dashboard/document-list")
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

    const onClickDeleteButton = async () => {
        Swal.fire({
          title: `Are you sure ? `,
          icon: 'warning',
          html: `Do you want to delete this Document? <br> This document will be deleted immediately`,
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
        if (location.pathname === `/dashboard/studio/approved/${id}`) {
            onClickDeleteRequestButton()
        }
        if (location.pathname === `/dashboard/studio/${id}/delete`) {
            onClickDeleteButton()
        }
        
        // if (location.pathname === `/dashboard/studio/approved/${id}/${requestedUserId}`) {
        //     onClickApprovedButton()
        // }
    }, [location.pathname])


    useEffect(() => {
     if (docObj) {
         user.approvalDomain.map((item,index) => {
             if (item == docObj.domainName) {
               return setAccess(true)
            }
        })
     }
    }, [docObj])
    

    /* Excel export */
    const handleExportClick = (data) => {
        
        console.log("handleExportClick----", data);
         // Process data into worksheet format
         const worksheet = utils.json_to_sheet(data);
    
         // Add row spans and column spans
         worksheet['!ref'] = 'A1:E10'; // Set the worksheet range to include all cells
         for (const row of data) {
            let _row = row
           for (const cell of _row.cells) {
             if (cell.rowSpan > 1) {
               worksheet[`!merges`].push({ s: { c: cell.columnIndex, r: cell.rowIndex }, e: { c: cell.columnIndex, r: cell.rowIndex + cell.rowSpan - 1 } });
             }
             if (cell.columnSpan > 1) {
               worksheet[`!merges`].push({ s: { c: cell.columnIndex, r: cell.rowIndex }, e: { c: cell.columnIndex + cell.columnSpan - 1, r: cell.rowIndex } });
             }
           }
         }
     
         // Create and export workbook
         const workbook = utils.book_new();
         utils.book_append_sheet(workbook, worksheet, 'Sheet1');
         const buffer = write(workbook, { bookType: 'xlsx' });
         const binaryString = utils.encode_buffer(buffer, 'binary');
         const blob = new Blob([binaryString], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
         FileSaver.saveAs(blob, fileName);
      };

    return (
        <Sidebar.Pushable style={{ display: "flex", maxWidth: '100%', maxHeight: "100%", overflow: 'hidden', width: "100%", flexDirection: "column" }}>
            <Sidebar
                style={{
                    width: 800,
                }}
                as={'div'}
                animation="overlay"
                icon="labeled"
                direction="right"
                onHide={() => setVisible(false)}
                onHidden={() => navigate(`/dashboard/studio/${id}`)}
                vertical={'vertical'}
                visible={visible}>
                <ReuploadDocument fromURL={`/dashboard/studio/${id}`} visible={visible} setVisible={setVisible} getAllData={getData} />
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
                onHidden={() => navigate(`/dashboard/studio/${id}`)}
                vertical={'vertical'}
                visible={modalOpen}>
                <StatusView
                    count={count}
                    blNo={getBlNo()} docNo={docObj?.documentNo} modalOpen={setModalOpen} getData={getData} documentId={id} />
            </Sidebar>
            <Sidebar.Pusher dimmed={visible || modalOpen} className="fadeIn">

                <div style={{ display: "flex", maxWidth: '100%', maxHeight: "100%", overflow: 'hidden', width: "100%", flexDirection: "column" }}>
                    <div style={{ display: "flex", maxWidth: '100%', maxHeight: "100%", overflow: 'hidden', width: "100%", }}>
                        <div style={{ flex: 1, paddingBottom: 47 }}>
                            <div style={{ height: 47, display: "flex", background: "#0f182a", color: "white" }}>
                                <div style={{ width: 47, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    onClick={() => { navigate("/dashboard/document-list") }}
                                ><Icon name="arrow left" style={{ marginTop: -5 }} /></div>
                                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-start" }}>{docObj?.documentNo} / {getBlNo()} </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                    <Dropdown icon='ellipsis vertical'
                                        floating
                                        labeled
                                        button
                                        className='icon headerMenu' >
                                        <Dropdown.Menu>
                                            {
                                            hasAccess(EXTRACTION) && <Dropdown.Item text='Extract' onClick={extract} />
                                            }
                                            {
                                                // user?.role != "documentation" ?
                                                hasAccess(REUPLOAD_PDF) ?
                                                    <Dropdown.Item text='Reupload PDF'
                                                        onClick={() => {
                                                            navigate('/dashboard/studio/reupload/' + id);
                                                            setVisible(true);
                                                        }}
                                                    /> : null
                                            }
                                            {
                                                // user?.role === "superAdmin" || (access && user.role == "admin")  ?                                                    <Dropdown.Item onClick={() => {
                                                hasAccess(DELETE_DOCUMENT)  ?                                                    <Dropdown.Item onClick={() => {
                                                        navigate(`/dashboard/studio/${id}/delete`);
                                                    }} text='Delete Document' />
                                                    :
                                                    <Dropdown.Item onClick={() => {
                                                        navigate('/dashboard/studio/approved/' + id);
                                                    }} text='Request To Delete Document' />

                                            }
                                            {
                                                hasAccess(VIEW_RAW) ?
                                                    <Dropdown.Item onClick={() => { setRawModal(!rawModal); }} text='View Raw' /> : null
                                            }
                                            {
                                                hasAccess(VIEW_RAW) ?
                                                    <Dropdown.Item onClick={() => { setRawTableModal(!rawTableModal); }} text='View Raw Table' /> : null
                                            }
                                            {
                                                hasAccess(VIEW_RAW) ?
                                                    <Dropdown.Item onClick={() => { handleExportClick(rawTableModalData); }} text='Export Raw Table' /> : null
                                            }
                                            

                                            {
                                                // (user?.role != "documentation") && <div
                                                hasAccess(ASSIGN_TO) && <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        padding: 15
                                                    }}
                                                >
                                                    <strong style={{ color: 'black' }}>Assign To</strong>
                                                    <p className="sub-text">
                                                        {docObj?.assignToUser ? docObj?.assignToUser?.name : "--"}
                                                        <i className="edit icon blue" onClick={() => setOpenAssignToModal(true)} style={{ marginLeft: "5px" }}></i>
                                                        {openAssignToModal && <AssignToModal setModalOpen={setOpenAssignToModal} modalOpen={openAssignToModal} defaultValue={docObj?.assignToUser?._id} documentId={docObj._id} getData={getData} />}
                                                    </p>
                                                </div>
                                            }

                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                            </div>
                            <div style={{ height: '100%', background: "#a7c4ff1f", }}>
                                <div style={{ display: 'flex', padding: "5px 20px", justifyContent: 'space-between', borderBottom: "1px solid #ccc" }}>

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',

                                        }}
                                    >
                                        <strong>Extraction Status</strong>
                                        <p className="sub-text" style={{ marginTop: 0 }}>
                                            {getPercentage(docObj.fieldsAndValues)} | {getRemainingFileds(docObj.fieldsAndValues)}
                                        </p>
                                    </div>


                                    {docObj?.syncWithOtm ? (
                                        <Popup
                                            content={moment(docObj?.lastSyncTime).format('DD/MM/YYYY HH:mm a')}
                                            trigger={
                                                <Button
                                                    size='mini' compact

                                                    icon

                                                    style={{ height: '35px', width: '120px' }}
                                                    onClick={() => {
                                                        setModalOpen(true);
                                                    }}
                                                    loading={pushLoading}
                                                    color={docObj?.syncWithOtm ? 'green' : 'blue'}
                                                >

                                                    <Icon name="check" style={{ marginRight: '10px !important' }} />
                                                    <span style={{ paddingLeft: 10 }}>
                                                        Sync Done
                                                    </span>

                                                </Button>
                                            }
                                        />
                                    ) : hasAccess(SYNC_WITH_ERP) && (
                                        <Button
                                            size='mini' compact
                                            style={{ height: '35px', width: '120px' }}
                                            onClick={pushToOTMClickHandler}
                                            loading={pushLoading}
                                            color={docObj?.syncWithOtm ? 'green' : 'blue'}
                                        >
                                            Push to API
                                        </Button>
                                    )}
                                </div>
                                {rawModal && <RawModal rawModalData={rawModalData} />}
                                {rawTableModal && <TableRawTable rawModalData={rawTableModalData}/>}
                                {docObj.documentUrl &&
                                    <FieldsAndValuesCmp documentId={id} _docObj={docObj} selectedSentence={selectedSentence}
                                        setDocObj={setDocObj} clearSelection={clearSelection} onChangeClearCanvas={OnChangeClearCanvas}
                                        setOnChangeClearCanvas={setOnChangeClearCanvas} />
                                }
                            </div>

                        </div>

                        <div style={{ borderLeft: "1px solid #ccc" }}>
                            {docObj.documentUrl &&
                                <DocViewerCmp url={docObj.documentUrl} data={docObj} setSelectedText={setSelectedText}
                                    selectedSentence={selectedSentence}
                                    clearSelectedState={clearSelectedState} onChangeClearCanvas={onChangeClearCanvas}
                                />
                            }
                        </div>
                    </div>
                    <div style={{ width: '100%', background: "#a7c4ff1f", borderTop: '2px solid rgb(204 204 204)' }}>
                       { (docObj?.extractedData?.modelId == "prebuilt-invoice")
                        ? docObj.documentUrl && <InvoiceUnitCmp documentId={id} _docObj={docObj} selectedSentence={selectedSentence}
                            setDocObj={setDocObj} clearSelection={clearSelection} onChangeClearCanvas={OnChangeClearCanvas}
                            setOnChangeClearCanvas={setOnChangeClearCanvas} />
                        :docObj.documentUrl && <ShipunitCmp documentId={id} _docObj={docObj} selectedSentence={selectedSentence}
                            setDocObj={setDocObj} clearSelection={clearSelection} onChangeClearCanvas={OnChangeClearCanvas}
                            setOnChangeClearCanvas={setOnChangeClearCanvas} />
                        }
                    </div>
                    <Toaster />
                </div>

            </Sidebar.Pusher>
        </Sidebar.Pushable>
    )
}





const EditableTextItem = ({ _setDocObj, docObj, compact, field, documentId, thisSelectedSentence, clearSelection }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(field.overrideValue ? field.overrideValue : field.fieldValue?.toString());
    const inputRef = useRef(null);
    const [lastUpdatedText, setLastUpdatedText] = useState(field.overrideValue ? field.overrideValue : field.fieldValue?.toString());
    const divRef = useRef(null);
    const [height, setHeight] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [textAreaLine, setTextAreaLines] = useState(1);
    const [isFocused, setIsFocused] = useState(false);
    let lineHeight = 25;
    let orginalText = field.fieldValue?.toString();

    useEffect(() => {
        if (thisSelectedSentence) {
            if (isFocused) {
                setText(thisSelectedSentence.trim())
            }
        }
    }, [thisSelectedSentence])

    useEffect(() => {
        setHeight(divRef?.current?.offsetHeight);
        const getHeight = () => {
            setHeight(divRef?.current?.offsetHeight);
        };
        window.addEventListener("resize", getHeight);
        return () => window.removeEventListener("resize", getHeight);
    }, []);


    useEffect(() => {
        let lines = Math.ceil(height / lineHeight);
        if (lines > 1) lines++;
        setTextAreaLines(lines);
    }, [height])


    const handleDoubleClick = () => {
        if (!isEditing) {
            setHeight(divRef?.current?.offsetHeight);
            setIsEditing(true);
        }
    };

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const closeEdit = () => {
        setText(lastUpdatedText);
        setIsEditing(false);
    };

    const saveField = async () => {

        let newData = {};


        if (field.shipUnit && field.shipUnit.attr) {

            newData = {
                isShipUnit: true,
                overrideValue: text,
                fieldName: {
                    attr: field.shipUnit.attr,
                    itemId: field.shipUnit.itemId
                }
            }

        } else {
            if (text?.trim() != orginalText) {
                newData = {
                    overrideValue: text?.trim(),
                    fieldName: field.fieldName
                }
            } else {
                newData = {
                    overrideValue: null,
                    fieldName: field.fieldName
                };
            }
        }




        const url = `/v1/documents/update-field/${documentId}`;

        console.log(url, newData);
        setButtonLoading(true);
        const response = await apiPOST(url, newData);
        setButtonLoading(false);
        console.log("response", response);
        if (response.status == '200') {
            toast.success('Successfully updated!', {
                position: 'bottom-left',
            });
        } else {
            toast.error('Something went wrong!', {
                position: 'bottom-left',
            });
            setText("")
        }
        setIsEditing(false);
        setLastUpdatedText(text);


        if (field.shipUnit && field.shipUnit.attr) {
            console.log("field.shipUnit", field.shipUnit);

        } else {

            let fieldIndex = docObj.fieldsAndValues.findIndex((aField) => {
                return aField.fieldName == field.fieldName;
            });

            if (text != orginalText) {
                docObj.fieldsAndValues[fieldIndex].overrideValue = text;
            } else {
                docObj.fieldsAndValues[fieldIndex].overrideValue = null;
            }

            _setDocObj(JSON.parse(JSON.stringify(docObj)));

        }


    }

    const resetToOrginal = () => {
        setText(orginalText);
    }

    useEffect(() => {
        if (isEditing) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div onDoubleClick={handleDoubleClick} >
            {isEditing ? (
                <div>
                    <textarea
                        onFocus={(e) => {
                            setIsFocused(true)
                        }}
                        onBlur={(e) => {
                            clearSelection()
                            setIsFocused(false)
                        }}
                        value={text}
                        onChange={handleChange}
                        rows={textAreaLine}
                        ref={inputRef}
                        style={{ width: "100%", outline: "transparent", border: "1px solid #3c77b296", borderRadius: 4 }}
                    />
                    <div>


                        {compact ? <Button icon size='mini' compact primary onClick={saveField} loading={buttonLoading}> <Icon name="save" /> </Button> : <Button className='saveandback' size='mini' compact primary onClick={saveField} style={{ paddingLeft: '30px !important' }} loading={buttonLoading} labelPosition="left" icon>
                            Save
                            <Icon name="save" />
                        </Button>}

                        {compact ? <Button icon size='mini' compact onClick={resetToOrginal}> <Icon name="history" /> </Button> : <Button size='mini' compact onClick={resetToOrginal}>Set to Original</Button>}

                        {compact ? <Button icon size='mini' compact onClick={closeEdit}> <Icon name="ban" /> </Button> : <Button size='mini' compact onClick={closeEdit}>Cancel</Button>}


                    </div>


                </div>

            ) : (
                <div style={{ cursor: "pointer" }} ref={divRef}>{text ? text : "[-NA-]"}</div>
            )}
        </div>
    );
};


const EditableDateItem = ({ _setDocObj, docObj, compact, field, documentId, thisSelectedSentence, clearSelection }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(field.overrideValue ? field.overrideValue : field.fieldValue?.toString());
    const inputRef = useRef(null);
    const [lastUpdatedText, setLastUpdatedText] = useState(field.overrideValue ? field.overrideValue : field.fieldValue?.toString());
    const divRef = useRef(null);
    const [height, setHeight] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [textAreaLine, setTextAreaLines] = useState(1);
    const [isFocused, setIsFocused] = useState(false);
    let lineHeight = 25;
    // let orginalText = field.fieldValue?.toString();
    let orginalText = moment(field.fieldValue).format('YYYY-MM-DD');

    useEffect(() => {
        if (thisSelectedSentence) {
            if (isFocused) {
                setText(thisSelectedSentence.trim())
            }
        }
    }, [thisSelectedSentence])


    const handleDoubleClick = () => {
        if (!isEditing) {
            setHeight(divRef?.current?.offsetHeight);
            setIsEditing(true);
        }
    };

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const closeEdit = () => {
        setText(lastUpdatedText);
        setIsEditing(false);
    };

    const saveField = async () => {

        let newData = {};




        if (text != orginalText) {
            newData = {
                overrideValue: text,
                fieldName: field.fieldName
            }
        } else {
            newData = {
                overrideValue: null,
                fieldName: field.fieldName
            };
        }


        const url = `/v1/documents/update-field/${documentId}`;

        console.log(url, newData);
        setButtonLoading(true);
        const response = await apiPOST(url, newData);
        setButtonLoading(false);
        if (response.status == '200') {
            toast.success('Successfully updated!', {
                position: 'bottom-left',
            });
        } else {
            toast.error('Successfully updated!', {
                position: 'bottom-left',
            });
        }
        setIsEditing(false);
        setLastUpdatedText(text)


        let fieldIndex = docObj.fieldsAndValues.findIndex((aField) => {
            return aField.fieldName == field.fieldName;
        });

        if (text != orginalText) {
            docObj.fieldsAndValues[fieldIndex].overrideValue = text;
        } else {
            docObj.fieldsAndValues[fieldIndex].overrideValue = null;
        }

        _setDocObj(JSON.parse(JSON.stringify(docObj)));

    }

    const resetToOrginal = () => {
        setText(orginalText);
    }

    useEffect(() => {
        if (isEditing) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div onDoubleClick={handleDoubleClick} >
            {isEditing ? (
                <div>
                    <input
                        type="date"
                        onFocus={(e) => {
                            setIsFocused(true)
                        }}
                        onBlur={(e) => {
                            clearSelection()
                            setIsFocused(false)
                        }}
                        value={moment(text).format('YYYY-MM-DD')}
                        onChange={handleChange}
                        ref={inputRef}
                        style={{ width: "100%", outline: "transparent", border: "1px solid #3c77b296", borderRadius: 4 }}
                    />
                    <div>


                        {compact ? <Button icon size='mini' compact primary onClick={saveField} loading={buttonLoading}> <Icon name="save" /> </Button> : <Button className='saveandback' size='mini' compact primary onClick={saveField} style={{ paddingLeft: '30px !important' }} loading={buttonLoading} labelPosition="left" icon>
                            Save
                            <Icon name="save" />
                        </Button>}

                        {compact ? <Button icon size='mini' compact onClick={resetToOrginal}> <Icon name="history" /> </Button> : <Button size='mini' compact onClick={resetToOrginal}>Set to Original</Button>}

                        {compact ? <Button icon size='mini' compact onClick={closeEdit}> <Icon name="ban" /> </Button> : <Button size='mini' compact onClick={closeEdit}>Cancel</Button>}


                    </div>


                </div>

            ) : (
                <div style={{ cursor: "pointer" }} ref={divRef}>{moment(text).format(field.field.dateFormat) ? moment(text).format(field.field.dateFormat) : "[-NA-]"}</div>
            )}
        </div>
    );
};


const EditableMasterItem = ({ _setDocObj, docObj, compact, field, documentId, thisSelectedSentence, clearSelection }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(field.overrideValue ? field.overrideValue : field.fieldValue?.toString());
    const [buttonLoading, setButtonLoading] = useState(false);
    const divRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selected, setSelected] = useState()

    let orginalText = field.fieldValue?.toString();


    useEffect(() => {
        if (thisSelectedSentence) {
            if (isFocused) {
                console.log(":setting : ", thisSelectedSentence)
                handleSearchChange({}, { value: thisSelectedSentence.trim() })
            }
        }
    }, [thisSelectedSentence])

    const handleDoubleClick = () => {
        if (!isEditing) {
            setIsEditing(true);
            dispatch({
                type: 'SET_SELECTED',
                newState: {
                    loading: false,
                    results: [{
                        title: text
                    }],
                    value: text,
                },
            })
        }
    };

    const closeEdit = () => {
        setIsEditing(false);
    };

    const resetToOrginal = () => {
        dispatch({
            type: 'SET_SELECTED',
            newState: {
                loading: false,
                results: [{
                    title: orginalText
                }],
                value: orginalText,
            },
        })
        getMastersDataBySearch({ value: orginalText })
    }

    const saveField = async () => {

        let newData = {};


        if (field.shipUnit && field.shipUnit.attr) {
             const found = results.find(item=>item.value == value)
                if (found) {
                    newData = {
                    isShipUnit: true,
                    overrideValue: value,
                    fieldName: {
                        attr: field.shipUnit.attr,
                        itemId: field.shipUnit.itemId
                    }
            }
                }else{
                    toast.error('Please select an option from the dropdown!', {
                        position: 'bottom-left',
                    });
                    dispatch({
                        type: 'CLEAN_QUERY'
                    })
                    return
                }

            console.log("newData : ", newData);

        } else {
            // if(selected) {
            //     if ((value != orginalText) && (results.length == 1)) {
            //         newData = {
            //             overrideValue: value,
            //             fieldName: field.fieldName
            //         }
            //     } else if((results.length > 0)) {
            //         console.log("Else Ala na");
            //         newData = {
            //             overrideValue: null,
            //             fieldName: field.fieldName
            //         };
            //     }
            // }
            console.log("Editable save ::", results[0], value);
            const found = results.find(item => item.value == value)
            if (found) {
                if ((value != orginalText)) {
                    newData = {
                        overrideValue: value,
                        fieldName: field.fieldName
                    }
                } else if ((results.length > 0)) {
                    newData = {
                        overrideValue: null,
                        fieldName: field.fieldName
                    };
                }
            } else {
                toast.error('Please select an option from the dropdown!', {
                    position: 'bottom-left',
                });
                dispatch({
                    type: 'CLEAN_QUERY'
                })
                return
            }
        }

        setSelected(null)
        const url = `/v1/documents/update-field/${documentId}`;
        console.log(url, newData);
        setButtonLoading(true);
        const response = await apiPOST(url, newData);
        setButtonLoading(false);
        // console.log('response',response);
        if (response.status == '200') {
            setText(value)
            toast.success('Successfully updated!', {
                position: 'bottom-left',
            });
        } else {
            toast.error('Something went wrong! ', {
                position: 'bottom-left',
            });
        }
        setIsEditing(false);


        if (field.shipUnit && field.shipUnit.attr) {

        } else {

            let fieldIndex = docObj.fieldsAndValues.findIndex((aField) => {
                return aField.fieldName == field.fieldName;
            });

            if (value != orginalText) {
                docObj.fieldsAndValues[fieldIndex].overrideValue = value;
            } else {
                docObj.fieldsAndValues[fieldIndex].overrideValue = null;
            }

            _setDocObj(JSON.parse(JSON.stringify(docObj)));

        }
    }

    const initialState = {
        loading: false,
        results: [],
        value: "",
    }

    function dropDownReducer(state, action) {
        switch (action.type) {
            case 'CLEAN_QUERY':
                return initialState
            case 'START_SEARCH':
                return { ...state, loading: true, value: action.query }
            case 'FINISH_SEARCH':
                return { ...state, loading: false, results: action.results }
            case 'UPDATE_SELECTION':
                return { ...state, value: action.selection }
            case 'SET_SELECTED':
                return { ...action.newState }
            default:
                throw new Error()
        }
    }

    function getPMFormattedDDValue(docRow = {}) {

        if (docRow) {
            console.log("selection value ::", `${docRow.locationXid} - ${docRow.locationName}`);
            return `${docRow.locationXid} - ${docRow.locationName}`
        } else {
            return ""
        }
    }

    function handleOnResultSelect(e, data) {
        setSelected(data)
        let value = data.result.value.trim() || ""
        dispatch({ type: 'UPDATE_SELECTION', selection: value })
    }

    const [state, dispatch] = React.useReducer(dropDownReducer, initialState)
    const { loading, results, value } = state
    const timeoutRef = React.useRef()
    const handleSearchChange = React.useCallback(async (e, data) => {
        getMastersDataBySearch(data)
    }, [])

    function getMastersDataBySearch(data) {

        const collectionName = field.field.master.collectionName
        // this code For portMatsers
        let searchValue
        if (collectionName == "port_masters" || collectionName == "air_port_masters") {
            searchValue = data.value?.split("-")[0]
        } else {
            searchValue = data.value
        }

        clearTimeout(timeoutRef.current)
        // data.value = data.value.trim();
        dispatch({ type: 'START_SEARCH', query: data.value })

        timeoutRef.current = setTimeout(async () => {

            let res;
            if (searchValue) {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=${collectionName}&search=${searchValue}`
                );
            }
            else {
                res = await apiGET(
                    `/v1/portmaster/collectionnamelist?collectionName=${collectionName}`
                );
            }
            let response = res?.data?.data;
            let result = [];
            /* TODO: correct this later, now hardcoding port_master type here for custom value after selection */
            if (field.field.master.collectionName == "port_masters" || field.field.master.collectionName == "air_port_masters") {
                for (let index = 0; index < response.length; index++) {
                    const aRes = response[index];
                    result.push({
                        title: aRes[field.field.master.search] + " | " + aRes[field.field.master.value],
                        value: getPMFormattedDDValue(aRes),
                    })
                }
            } else {
                for (let index = 0; index < response.length; index++) {
                    const aRes = response[index];
                    result.push({
                        title: aRes[field.field.master.search] + " | " + aRes[field.field.master.value],
                        value: aRes[field.field.master.value]
                    })
                }
            }

            dispatch({
                type: 'FINISH_SEARCH',
                results: result,
            })
        }, 300)
    }
    // useEffect(() => {
    //     if (selected) {
    //         dispatch({ type: 'UPDATE_SELECTION', selection: selected.result.title?.split("|")[1] ? selected.result.title?.split("|")[1].trim() : "" })
    //     }
    // }, [selected])

    useEffect(() => {
        if (isEditing) {
            getMastersDataBySearch({ value: text })
        }
    }, [isEditing])

    return (
        <div onDoubleClick={handleDoubleClick}>
            {isEditing ? (
                <div>
                    <div style={{ marginBottom: 5 }}>
                        <Search
                            style={{ width: '100%' }}
                            className='masterDD'
                            loading={loading}
                            placeholder='Search...'

                            onFocus={(e) => {
                                setIsFocused(true)
                            }}
                            onBlur={(e) => {
                                clearSelection()
                                setIsFocused(false)
                            }}

                            onResultSelect={handleOnResultSelect}
                            onSearchChange={handleSearchChange}
                            results={results}
                            value={value}
                            defaultOpen={true}
                        />
                    </div>
                    <div>


                        {compact ? <Button icon size='mini' compact primary onClick={saveField} loading={buttonLoading}> <Icon name="save" /> </Button> : <Button className='saveandback' size='mini' compact primary onClick={saveField} style={{ paddingLeft: '30px !important' }} loading={buttonLoading} labelPosition="left" icon>
                            Save
                            <Icon name="save" />
                        </Button>}

                        {compact ? <Button icon size='mini' compact onClick={resetToOrginal}> <Icon name="history" /> </Button> : <Button size='mini' compact onClick={resetToOrginal}>Set to Original</Button>}

                        {compact ? <Button icon size='mini' compact onClick={closeEdit}> <Icon name="ban" /> </Button> : <Button size='mini' compact onClick={closeEdit}>Cancel</Button>}




                        {/* <Button className='saveandback' size='mini' compact primary onClick={saveField} style={{ paddingLeft: '30px !important' }} loading={buttonLoading} labelPosition="left" icon>
                            Save
                            <Icon name="save" />
                        </Button>
                        <Button size='mini' compact onClick={resetToOrginal}>Set to Original</Button>

                        <Button size='mini' compact onClick={closeEdit}>Cancel</Button> */}
                    </div>
                </div>
            ) : (
                <div style={{ cursor: "pointer" }} ref={divRef}>{text ?
                    (field.field.master.collectionName == "countryCode" ? <><Flag name={text.toLowerCase().trim()} /> {text} </> : text)
                    : "[-NA-]"}</div>
            )}
        </div>
    );
};


function ShipunitCmp({ _docObj, extractedData = {}, documentId, selectedSentence = '',
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
    const [dateValue, setDateValue] = useState('');

    const [initialClientY, setInitialClientY] = useState("")

    const [panelHeight, setPanelHeight] = useState(100);



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

        }
        else {
            setThisSelectedSentence2(selectedSentence);
            if (selectedForEditing.fieldType != "master") {
                setThisSelectedSentence(selectedSentence);
            }

        }
    }, [selectedSentence]);


    let dragStart = (event, a, b) => {
        setInitialClientY(event.clientY)
    };

    let draggingResize = (event, a, b) => {
        event.preventDefault();
        if (event.clientY != 0) {
            let diffX = event.clientY - initialClientY;
            setPanelHeight(panelHeight - diffX);
            setInitialClientY(event.clientY)
        }
    };





    let removeRow = async (deleteItemID) => {
        const url = `/v1/documents/delete-field/${documentId}`;

        const response = await apiPOST(url, { itemId: deleteItemID, isShipUnit: true });
        console.log("response deleted", response);
        if (response.status == '200') {
            toast.success('Successfully deleted!', {
                position: 'bottom-left',
            });
        } else {
            toast.error('Something went wrong!', {
                position: 'bottom-left',
            });
        }

        for (let index = 0; index < fieldsAndValues.length; index++) {
            const aFieldValue = fieldsAndValues[index];

            if (aFieldValue.fieldName == "ship_unit_table") {
                // splice || filter
                const copy = aFieldValue.fieldValue.filter((item, i) => item.itemId !== deleteItemID);
                aFieldValue.fieldValue = [...copy]
            }
        }
        setFieldsAndValues(JSON.parse(JSON.stringify(fieldsAndValues)));


    }

    let addNewShipUnit = () => {

        for (let index = 0; index < fieldsAndValues.length; index++) {
            const aFieldValue = fieldsAndValues[index];

            if (aFieldValue.fieldName == "ship_unit_table") {
                aFieldValue.fieldValue.push({
                    itemId: Math.random().toString(36).slice(2),
                    container: '',
                    type: '',
                    weight: '',
                    uom: '',
                    shipper: '',
                    custom: '',
                    liner: '',
                })
            }
        }
        setFieldsAndValues(JSON.parse(JSON.stringify(fieldsAndValues)));
    }
    console.log('fieldsAndValues -----> main',fieldsAndValues);

    let renderTable = (aField, idx) => {
        return <Table compact className='shipUnitTable'>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Container</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Liner Seal</Table.HeaderCell>
                    <Table.HeaderCell>Shipper Seal</Table.HeaderCell>
                    <Table.HeaderCell>Custom Seal</Table.HeaderCell>
                    <Table.HeaderCell>Item</Table.HeaderCell>
                    <Table.HeaderCell>Pkg Type</Table.HeaderCell>
                    <Table.HeaderCell>Pkg Count</Table.HeaderCell>
                    <Table.HeaderCell>Weight/ UOM</Table.HeaderCell>
                    <Table.HeaderCell>Measu./ UOM</Table.HeaderCell>
                    {/* <Table.HeaderCell></Table.HeaderCell> */}
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {aField.fieldValue?.map((aRow, rowIndex) => {
                    return (
                        <Table.Row key={aRow.itemId}>
                            <Table.Cell>
                                <Button
                                    icon size='mini' compact
                                    onClick={() => {
                                        removeRow(aRow.itemId)
                                    }}>
                                    <Icon name="trash alternate" />
                                </Button>
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "2"} field={{
                                    fieldValue: aRow.container,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'container'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>

                                <EditableMasterItem compact={true} key={idx + "4"} field={{
                                    fieldValue: aRow.type,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'type'
                                    },
                                    field: {
                                        master: {
                                            collectionName: "container_iso_codes",
                                            search: 'text',
                                            value: "code"
                                        }
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "6"} field={{
                                    fieldValue: aRow.liner,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'liner'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "8"} field={{
                                    fieldValue: aRow.shipper,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'shipper'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "10"} field={{
                                    fieldValue: aRow.custom,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'custom'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableMasterItem compact={true} key={idx + "12"} field={{
                                    fieldValue: aRow.item,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'item'
                                    },
                                    field: {
                                        master: {
                                            collectionName: "itemMaster",
                                            search: 'text',
                                            value: "code"
                                        }
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableMasterItem compact={true} key={idx + "13"} field={{
                                    fieldValue: aRow.packageType,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'packageType'
                                    },
                                    field: {
                                        master: {
                                            collectionName: "packageTypeMaster",
                                            search: 'text',
                                            value: "code"
                                        }
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "14"} field={{
                                    fieldValue: aRow.packageCount,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'packageCount'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "15"} field={{
                                    fieldValue: aRow.weight,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'weight'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                                <EditableMasterItem compact={true} key={idx + "16"} field={{
                                    fieldValue: aRow.uom,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'uom'
                                    },
                                    field: {
                                        master: {
                                            collectionName: "weight_uom",
                                            search: 'text',
                                            value: "code"
                                        }
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "17"} field={{
                                    fieldValue: aRow.measurement,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'measurement'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                                <EditableMasterItem compact={true} key={idx + "18"} field={{
                                    fieldValue: aRow.m_uom,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'm_uom'
                                    },
                                    field: {
                                        master: {
                                            collectionName: "measurement_uom",
                                            search: 'text',
                                            value: "code"
                                        }
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>

    }


    return <>
        <div style={{ width: '100%', display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
                style={{
                    width: 40,
                    cursor: 'row-resize',
                    height: 20,
                    marginTop: -11,
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    background: 'white',
                    border: "1px solid #a4a4a4",
                    borderRadius: 4

                }}
                draggable={true}
                onDragStart={(e) => dragStart(e)}
                onDrag={(e) => draggingResize(e)}
                onDragEnd={() => {
                    // this.dragEndResize();
                }}>
                <div style={{ height: 8, width: 25, borderTop: '2px solid #878787', borderBottom: '2px solid #878787' }}>

                </div>
            </div>
        </div>

        <Scrollbars style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: -10, flex: 1, height: panelHeight, padding: 10 }} autoHide>
            <div style={{ flex: 1, display: 'flex', alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                {
                    fieldsAndValues && fieldsAndValues?.map((aField, idx) => {
                        if (aField.fieldName == "ship_unit_table") {
                            return renderTable(aField, idx)
                        }
                    })}
            </div>
            <div style={{ marginTop: 16, marginLeft: 10 }}>
                {/* <Button size='mini' compact icon  onClick={addNewShipUnit}> <Icon name="plus" /> Add New Ship Unit </Button> */}
                <Button
                    icon size='mini' compact
                    onClick={() => {
                        addNewShipUnit()
                    }}>
                    Add new Row
                </Button>
            </div>
        </Scrollbars>
    </>

}

function InvoiceUnitCmp({ _docObj, extractedData = {}, documentId, selectedSentence = '',
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
    const [dateValue, setDateValue] = useState('');

    const [initialClientY, setInitialClientY] = useState("")

    const [panelHeight, setPanelHeight] = useState(100);



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

        }
        else {
            setThisSelectedSentence2(selectedSentence);
            if (selectedForEditing.fieldType != "master") {
                setThisSelectedSentence(selectedSentence);
            }

        }
    }, [selectedSentence]);


    let dragStart = (event, a, b) => {
        setInitialClientY(event.clientY)
    };

    let draggingResize = (event, a, b) => {
        event.preventDefault();
        if (event.clientY != 0) {
            let diffX = event.clientY - initialClientY;
            setPanelHeight(panelHeight - diffX);
            setInitialClientY(event.clientY)
        }
    };





    let removeRow = async (deleteItemID) => {
        const url = `/v1/documents/delete-field/${documentId}`;

        const response = await apiPOST(url, { itemId: deleteItemID, isShipUnit: true });
        console.log("response deleted", response);
        if (response.status == '200') {
            toast.success('Successfully deleted!', {
                position: 'bottom-left',
            });
        } else {
            toast.error('Something went wrong!', {
                position: 'bottom-left',
            });
        }

        for (let index = 0; index < fieldsAndValues.length; index++) {
            const aFieldValue = fieldsAndValues[index];

            if (aFieldValue.fieldName == "ship_unit_table") {
                // splice || filter
                const copy = aFieldValue.fieldValue.filter((item, i) => item.itemId !== deleteItemID);
                aFieldValue.fieldValue = [...copy]
            }
        }
        setFieldsAndValues(JSON.parse(JSON.stringify(fieldsAndValues)));


    }

    let addNewShipUnit = () => {

        for (let index = 0; index < fieldsAndValues.length; index++) {
            const aFieldValue = fieldsAndValues[index];

            if (aFieldValue.fieldName == "ship_unit_table") {
                aFieldValue.fieldValue.push({
                    itemId: Math.random().toString(36).slice(2),
                    description,
                    productCode,
                    amountValue,
                    amountCurrencyCode,
                    quantity,
                    taxAmount,
                    taxCurrencyCode,
                    taxRate,
                    unitPriceAmount,
                    unitPriceCurrencyCode
                })
            }
        }
        setFieldsAndValues(JSON.parse(JSON.stringify(fieldsAndValues)));
    }

    let renderTable = (aField, idx) => {
        return <Table compact className='shipUnitTable'>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>Description of supply</Table.HeaderCell>
                    <Table.HeaderCell>HSN Code</Table.HeaderCell>
                    <Table.HeaderCell>Qty </Table.HeaderCell>
                    <Table.HeaderCell>Tax</Table.HeaderCell>
                    <Table.HeaderCell>TaxRate</Table.HeaderCell>
                    <Table.HeaderCell>UnitPrice</Table.HeaderCell>
                    <Table.HeaderCell>Amount</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {aField.fieldValue?.map((aRow, rowIndex) => {
                    return (
                        <Table.Row key={aRow.itemId}>
                            <Table.Cell>
                                <Button
                                    icon size='mini' compact
                                    onClick={() => {
                                        removeRow(aRow.itemId)
                                    }}>
                                    <Icon name="trash alternate" />
                                </Button>
                                        {" "}{ rowIndex + 1}
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "2"} field={{
                                    fieldValue: aRow.description,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'description'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "2"} field={{
                                    fieldValue: aRow.productCode,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'productCode'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "10"} field={{
                                    fieldValue: aRow.quantity,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'quantity'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                          
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "14"} field={{
                                    fieldValue: aRow?.taxCurrencyCode,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'taxCurrencyCode'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                                <EditableTextItem compact={true} key={idx + "14"} field={{
                                    fieldValue: aRow.taxCurrencyCode,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'taxCurrencyCode'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "14"} field={{
                                    fieldValue: aRow.taxRate,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'taxRate'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "15"} field={{
                                    fieldValue: aRow.unitPriceAmount,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'unitPriceAmount'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                                <EditableTextItem compact={true} key={idx + "15"} field={{
                                    fieldValue: aRow.unitPriceCurrencyCode,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'unitPriceCurrencyCode'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />

                              
                            </Table.Cell>
                            <Table.Cell>
                                <EditableTextItem compact={true} key={idx + "17"} field={{
                                    fieldValue: aRow?.amountValue,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: `amountValue`
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                                <EditableTextItem compact={true} key={idx + "17"} field={{
                                    fieldValue: aRow?.amountCurrencyCode,
                                    shipUnit: {
                                        itemId: aRow.itemId,
                                        attr: 'amountCurrencyCode'
                                    }
                                }} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>

    }


    return <>
        <div style={{ width: '100%', display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
                style={{
                    width: 40,
                    cursor: 'row-resize',
                    height: 20,
                    marginTop: -11,
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    background: 'white',
                    border: "1px solid #a4a4a4",
                    borderRadius: 4

                }}
                draggable={true}
                onDragStart={(e) => dragStart(e)}
                onDrag={(e) => draggingResize(e)}
                onDragEnd={() => {
                    // this.dragEndResize();
                }}>
                <div style={{ height: 8, width: 25, borderTop: '2px solid #878787', borderBottom: '2px solid #878787' }}>

                </div>
            </div>
        </div>

        <Scrollbars style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: -10, flex: 1, height: panelHeight, padding: 10 }} autoHide>
            <div style={{ flex: 1, display: 'flex', alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                {
                    fieldsAndValues && fieldsAndValues?.map((aField, idx) => {
                        if (aField.fieldName == "ship_unit_table") {
                            return renderTable(aField, idx)
                        }
                    })}
            </div>
            <div style={{ marginTop: 16, marginLeft: 10 }}>
                {/* <Button size='mini' compact icon  onClick={addNewShipUnit}> <Icon name="plus" /> Add New Ship Unit </Button> */}
                <Button
                    icon size='mini' compact
                    onClick={() => {
                        addNewShipUnit()
                    }}>
                    Add new Row
                </Button>
            </div>
        </Scrollbars>
    </>

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
        setFieldsAndValues(docObj.fieldsAndValues);
    }, [docObj]);

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
            // console.log("selectFieldFor Editing tempObj", tempObj);

        }
        else {
            setThisSelectedSentence2(selectedSentence);
            if (selectedForEditing.fieldType != "master") {
                setThisSelectedSentence(selectedSentence);
                // console.log("selectFieldFor selectedSentence", selectedSentence);
            }

        }
    }, [selectedSentence]);

    const [editMode, setEditMode] = useState(false);
    const [clickedFieldIndex, setClickedFieldIndex] = useState();


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
        console.log("selectFieldFor Editing", selectedForEditing);
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

        let newTempObj = JSON.parse(JSON.stringify(docObj));
        newTempObj.fieldsAndValues = fieldsAndValues;
        setDocObj(newTempObj);
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

    let showSelectedField = (aField, idx) => {
        // console.log("on")
    }
    let clearSelectedField = (aField, idx) => {
        // console.log("clear")
    }


    let renderField = (aField, idx) => {

        if (aField?.field?.fieldType == "text") {
            return <div className='doc-field' key={idx + "1"} style={{ padding: '5px', paddingLeft: 10 }}>

                <div style={{ fontWeight: 600, minWidth: 100 }}>{aField.displayName} {aField?.overrideValue?.length ? '*' : null}: </div>
                <div style={{}}>
                    <EditableTextItem _setDocObj={_setDocObj} docObj={docObj} key={idx + "2"} field={aField} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                </div>

            </div>
        }
        else if (aField?.field?.fieldType == "master") {
            return <div className='doc-field' key={idx + "3"} style={{ padding: '5px', paddingLeft: 10 }}>

                <div style={{ fontWeight: 600, minWidth: 100 }}>{aField.displayName} {aField?.overrideValue?.length ? '*' : null}: </div>
                <div style={{}}>
                    <EditableMasterItem _setDocObj={_setDocObj} docObj={docObj} key={idx + "4"} field={aField} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                </div>

            </div>
        } else if (aField?.field?.fieldType == "date") {
            return <div className='doc-field' key={idx + "3"} style={{ padding: '5px', paddingLeft: 10 }}>

                <div style={{ fontWeight: 600, minWidth: 100 }}>{aField.displayName} {aField?.overrideValue?.length ? '*' : null}: </div>
                <div style={{}}>
                    <EditableDateItem _setDocObj={_setDocObj} docObj={docObj} key={idx + "4"} field={aField} documentId={documentId} thisSelectedSentence={thisSelectedSentence} clearSelection={clearSelection} />
                </div>

            </div>
        }

    }


    return <Scrollbars style={{ display: "flex", flexDirection: "column", flex: 1, height: '100%', padding: 10 }} autoHide>
        <div style={{ padding: '10px 15px 50px 10px' }}>
            {fieldsAndValues?.length ? (
                fieldsAndValues.map((aField, idx) => {
                    return renderField(aField, idx)
                })) : ""}
        </div>



    </Scrollbars>
}



class DocViewerCmp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber: 1,
            totalPages: 1,
            pageWidth: window.innerWidth - 400,
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
        event.preventDefault();
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

            // for (let w = 0; w < aPage.words.length; w++) {
            //     const aWord = aPage.words[w];
            //     context.lineWidth = 1;
            //     context.strokeStyle = '#8eb3ff';
            //     context.beginPath();
            //     context.moveTo(aWord.polygon[0].x * multiplier, aWord.polygon[0].y * multiplier);
            //     context.lineTo(aWord.polygon[1].x * multiplier, aWord.polygon[1].y * multiplier);
            //     context.lineTo(aWord.polygon[2].x * multiplier, aWord.polygon[2].y * multiplier);
            //     context.lineTo(aWord.polygon[3].x * multiplier, aWord.polygon[3].y * multiplier);
            //     context.closePath();
            //     context.stroke();
            // }
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
        // event.preventDefault();
        this.setState({ initialClientX: event.clientX });
    };

    draggingResize = (event, a, b) => {
        event.preventDefault();
        if (event.clientX != 0) {
            let diffX = event.clientX - this.state.initialClientX;

            if ((this.state.pageWidth - diffX) + 330 > window.innerWidth) {
                return;
            }
            this.setState({
                pageWidth: this.state.pageWidth - diffX,
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

            toast("Text copied !")
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
            <div style={{ display: 'flex', position: 'relative', width: this.state.pageWidth + 10, height: '100%' }}>

                <div
                    style={{
                        minWidth: 20,
                        cursor: 'col-resize',
                        height: 40,
                        marginLeft: -10,
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                        background: 'white',
                        border: "1px solid #a4a4a4",
                        borderRadius: 4

                    }}
                    draggable={true}
                    onDragStart={(e) => this.dragStart(e)}
                    onDrag={(e) => this.draggingResize(e)}
                    onDragEnd={() => {
                        this.dragEndResize();
                    }}>
                    <div style={{ height: 25, width: 8, borderLeft: '2px solid #878787', borderRight: '2px solid #878787' }}>

                    </div>
                </div>

                <div style={{ marginLeft: -10, overflow: "auto", maxWidth: this.state.pageWidth + 30, paddingTop: 46 }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '5px',
                            position: "absolute",
                            top: 0,
                            left: -1,
                            right: 0,
                            zIndex: 1,
                            width: this.state.pageWidth + 8,
                            background: "rgb(15, 24, 42)",
                            height: 47
                        }}>
                        {/* <span style={{ marginLeft: 0 }}>Total Pages : {this.state.totalPages}</span> */}

                        <Button.Group>
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

                            {this.state.selectedWord.length > 0 && (
                                <Popup
                                    content="Copy selected words to Clipboard"
                                    trigger={
                                        <Button icon onClick={this.copySelected}>
                                            <Icon name="copy outline" />
                                        </Button>
                                    }
                                />
                            )}

                            {this.state.selectedWord.length > 0 && (
                                <Popup
                                    content="Clear selection"
                                    trigger={
                                        <Button icon onClick={() => { this.clearCanvas(); toast("Selection Cleared !") }}>
                                            <Icon name="trash alternate outline" />
                                        </Button>
                                    }
                                />
                            )}


                        </Button.Group>


                        <Button.Group>

                            <Popup
                                content="View PDF"
                                trigger={
                                    <Button icon onClick={() => window.open(this.file.url, '_blank')}>
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
                                content="Reset"
                                trigger={
                                    <Button icon onClick={this.resetZoom}>
                                        <Icon name="expand" />
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


                        </Button.Group>

                        {/* <Slider  onChange={(e)=>{
                            console.log("e : ",e)
                        }}/> */}
                        <Pagination
                            boundaryRange={0}
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


                <div style={{ position: 'absolute', bottom: 15, left: 0 }}></div>
            </div>
        );
    }
}


function RawModal({ rawModalData }) {
    const renderValue = (value) => {
        if (value.kind === "string" || value.kind === "date") {
            return value.value;
        } else if (value.kind === "address") {
            return  value.value.road + ", " + value.value.city + ", " + value.value.postalCode + ", " + value.value.streetAddress
        } else if (value.kind === "currency") {
            return  value.value.amount + " " +  value.value.currencyCode
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
                                    <Table.Cell>{ 
                                        (value.kind == "currency") 
                                        ? value.value.amount + " " + value.value.currencyCode
                                        :  value.value
                                    }</Table.Cell>
                                    
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            ));
        }
    };

}
function TableRawTable({ rawModalData: rawTableModalData }) {
    console.log("rawTableModalData ----", rawTableModalData);
    const RenderTable = ({ cells = [], columnCount = 0, rowCount = 0 }) => {


        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                    {[...Array(columnCount).keys()].map((colIndex) => (
                        <Table.HeaderCell key={colIndex}> </Table.HeaderCell>
                    ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {[...Array(rowCount).keys()].map((rowIndex) => (
                    <Table.Row key={rowIndex}>
                        {cells
                        .filter((item) => item.rowIndex === rowIndex)
                        .map((item, colIndex) => (
                            <Table.Cell key={colIndex} rowSpan={item.rowSpan} colSpan={item.columnSpan}>
                            {item.content}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                    ))}
                </Table.Body>
                </Table>

        )
      };
      

    return (
    <Scrollbars className="fields-container">
        <div>{rawTableModalData && rawTableModalData.map((item) => <RenderTable columnCount={item.columnCount} rowCount={item.rowCount} cells={item.cells} />)}</div>

        <div style={{ height: 50 }}></div>
    </Scrollbars>
    );
};

