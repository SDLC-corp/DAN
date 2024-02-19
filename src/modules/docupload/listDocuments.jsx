import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Header, Icon, Input, Label, List, Menu, Modal, Popup, Search, Sidebar, Table } from 'semantic-ui-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';
import ShippingLineNameDropdown from '../../components/dropdown/shippingLineDropdown';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import Documentnotes from '../../components/notes/documentnotes';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';
import StatusView from '../job/viewStatus';
import MyTreeComponent from '../managedomain/domainTree';
import NestedDomain from '../../components/nodetree/nestedDomain';
import Papa from 'papaparse';
import { ADD_NOTES, DELETE_DOCUMENT, EXPORT_DOCUMENTS, VIEW_DOCUMENT, VIEW_STATUS, hasAccess } from '../../utils/accessHelper';


function DocumentList() {

  let { action } = useParams();
  const navigate = useNavigate()

  const [params, setParams] = useSearchParams()
  const [documentsdata, setDocumentData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const queryLimit = params.get('limit');
  const queryPage = params.get('page');
  const querySearchFilter = params.get('search');
  const queryShippingLineFilter = params.get('shippingline');
  const [page, setPage] = useState(+queryPage || 1);
  const [limit, setLimit] = useState(+queryLimit || 10);
  const [search, setSearch] = useState(querySearchFilter || '')
  const [modalOpen, setModalOpen] = useState(false)
  const [shippingLineData, setShippingLineData] = useState()
  const [percentCount, setPercentCount] = useState([])
  const [shippingLineId, setShippingLineId] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [checkDropDown, setCheckDropDown] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [visible, setVisible] = useState(false)
  const [documentId, setDocumentId] = useState('')
  const validInputRegex = /^[a-zA-Z0-9\s/_-]*$/;
  const [selectedNodePath, setSelectedNodePath] = useState([]);
  const [selectedShippingLineName, setSelectedShippingLineName] = useState(queryShippingLineFilter || "")
  const [viewStatusModal, setViewStatusModal] = useState(false)
  const [docObj, setDocObj] = useState({})
  const [carrierType, setCarrierType] = useState("all")

  const documentOptions = [
    { key:1, type: "ocean", text: 'HBL', value: "HBL" },
    { key:2, type: "ocean", text: 'MBL', value: 'MBL' },
    { key:3, type: "air", text: 'HAWBL', value: 'HAWBL' },
    { key:4, type: "air", text: 'MAWBL', value: 'MAWBL' },
  ]
  const [documentTypeOption, setDocumentTypeOption] = useState([])


  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'Documents List', content: 'Documents List', active: true },
  ];

  const carrierTypeOption = [
    {
      key:"all",
      text:"All",
      value:"all"
    },
    {
      key:"ocean",
      text:"Ocean",
      value:"ocean"
    },
    {
      key:"air",
      text:"Air",
      value:"air"
    },
  ]
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '' || validInputRegex.test(inputValue)) {
      setSearch(inputValue);
    } else {
      console.log("Validation: No special characters allowed");
    }
  };

  const getAllDocuments = async (shippingLine, documentType, fromDate, toDate,selectedNodePath,carrierType) => {
    try {
      setLoading(true);
      let res
      if (search || shippingLine || documentType || fromDate || toDate || selectedNodePath || carrierType) {
        const payload = {
          search: {
            searchTxt: search.trim(),
            shippingLineId: shippingLine,
            documentType: documentType,
            fromDate: fromDate,
            toDate: toDate,
            domainName: selectedNodePath,
            carrierType:carrierType
          }
        }
        const queryParams = objectToQueryParam(payload)

          res = await apiGET(`/v1/documents?${queryParams}&limit=${limit}&page=${page}`)
      }
      else {
          res = await apiGET(`/v1/documents/?limit=${limit}&page=${page}`,);
      }
      setLoading(false);
      if (res.status === 200) {
        let response = res?.data?.data
        setDocumentData(response.data);
          setTotalRows(response.totalCount);
          setLimit(response.limit)
          setPage(response.page)
      }
      else {
        Swal.fire({
          title: "Error!",
          text: res?.data?.data || "Something went wrong!",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error || "Something went wrong!",
        icon: "error",
      });
    }
  };

  const onClickViewDocuments = (row) => {
    navigate("/dashboard/document-list/view/" + row._id)
  }

  const onClickOpenModal = async (id) => {
    setModalOpen(true)
    const response = await apiGET(`v1/documents/${id}`)
    if (response.status === 200) {
      setShippingLineData(response.data.data)
    }
  }

  const showDataExtracted = (data) => {
    if (!data) return console.log("No Data Extracted")
    console.table(data.fields)
  }


  useEffect(() => {
    let result = []
    for (let i = 0; i < documentsdata.length; i++) {
      result.length = documentsdata.length
      let count = 0, total = documentsdata[i]?.fieldsAndValues
      for (let j = 0; j < total?.length; j++) {
        if ((total[j]?.fieldValue) != null && ( ((typeof(total[j]?.fieldValue) == 'string') && (total[j].fieldValue.trim() != "") )  || ((typeof(total[j]?.fieldValue) == 'object') && total[j]?.fieldValue?.length > 0))) {
          count = count + 1
        }
      }
      result[i] = { id: documentsdata[i]._id, filledFields: count, totalFields: total?.length }
    }
    setPercentCount([...result])
  }, [documentsdata])



  const calculatePercentage = (rowId) => {
    let found = percentCount?.find(item => (item.id == rowId))
    if (found && ((found.filledFields / found.totalFields) * 100)) {
      return `${((found.filledFields / found.totalFields) * 100).toFixed()}%`
    } else {
      return `00%`
    }
  }
  const showRemainingFeilds = (rowId) => {
    let found = percentCount?.find(item => (item.id == rowId))
    if (found) {
      return `${found.filledFields}/${found.totalFields}`
    }
  }

  const getBlNo = (fieldsAndValues) => {
    if (fieldsAndValues) {
      let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
      if (found[0]) return found[0].fieldValue
    }
    return ''
  }
  const onClickDeleteButton = async (id) => {
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
            getAllDocuments()
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
  const columns = [
    {
      name: '#',
      selector: (row) => row?.seqId,
      width: '6%',
    },
    {
      name: <p>Document No. / Location</p>,
      selector: (row) =>(!hasAccess(VIEW_DOCUMENT) ? (
        <div>
          <p>
            <strong>{row && row?.documentNo}</strong>
          </p>
          <>{row && row?.domainName}</>
        </div>
      ) : (
        <Link style={{ color: "black" }} to={`/dashboard/studio/${row._id}`}>
          <p>
            <strong>{row && row?.documentNo}</strong>
          </p>
          <>{row && row?.domainName}</>
        </Link>
      )),
      width: '16%',
    },
    {
      name: <p>Carrier Type</p>,
      selector: (row) => <p style={{textTransform:"capitalize"}}>{row?.shippingLine.type}</p>,
      width: '8%',
    },
    {
      name: <p>B/L No. / Type</p>,
      selector: (row) => (row &&
        <>
             <Popup
                  trigger={
                    <p style={{marginBottom:0}} data-tip={getBlNo(row.fieldsAndValues)}>{getBlNo(row.fieldsAndValues)}
          </p>
                  }
                  content={getBlNo(row.fieldsAndValues)}
                  position="top center"
                />
         
          <span style={{textTransform:"capitalize"}}>{row?.stageType}</span>
        </>
      ),
    },
    {
      name: <p>Document Info</p>,
      cell: (row) => (
        <div>
          <div> {row && `${row?.documentType}/${row?.orderTypeGid.split(".")[1] || ''}`}</div>
          {row && (
            <p>
              <strong>{row?.shippingLine?.code}</strong>
            </p>
          )}
        </div>
      ),
      width: '10%',
    },
    {
      name: <p>Extraction Info / Sync</p>,
      selector: (row) => (
        <div style={{ marginTop: 5, marginBottom: 5 }}>
          {row && (
            <>
              {calculatePercentage(row._id)} | {showRemainingFeilds(row._id)}
            </>
          )}
          {row?.syncWithOtm ? (
            <List style={{ marginTop: 5 }}>
              <List.Item>
                <Popup
                  trigger={
                    <Label color="green" horizontal>
                      ERP SYNC : YES
                    </Label>
                  }
                  content={moment(row?.lastSyncTime).format('DD/MM/YYYY HH:mm a')}
                  position="top center"
                />
              </List.Item>
            </List>
          ) : (
            <List style={{ marginTop: 5 }}>
              <List.Item>
                <Label color="gray" horizontal>
                  ERP SYNC : NO
                </Label>
              </List.Item>
            </List>
          )}
        </div>
      ),
      width: '15%',
    },
    {
      name: 'Created On',
      selector: (row) => (
        <>
          {' '}
          <p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>
          {moment(row?.createdAt).format('HH:mm a')}
        </>
      ),
      width: '10%',
    },
    {
      name: <p>Assign To</p>,
      selector: (row) => (
        <>
          {/* <Icon name="eye" onClick={() => {
          onClickOpenModal(row._id)
        }} /> */}
          {row?.assignToUser ? row?.assignToUser?.name : "--"}
        </>
      ),
    },
    {
      name: <p style={{ marginLeft: '1rem' }}>Action</p>,
      cell: (row) => (
        <div style={{ display: 'flex' }}>

          
        {
             hasAccess(VIEW_DOCUMENT) &&  <Link to={`/dashboard/studio/${row._id}`} className="ui icon button">
                {/*  */}
                <Popup
                content="View Document"
                trigger={
                  <i aria-hidden="true" class="icon eye"></i>
                }
              />
            </Link>
        }
             

            
          {/* <Link to={`/dashboard/document-list/view/${row._id}`} className="ui icon button">
            
            <Popup
            content="View Document"
            trigger={
              <i aria-hidden="true" class="eye icon"></i>
            }
          />
          </Link> */}
         {
            // (authContext?.user?.role != "documentation")&& <Popup
            hasAccess(DELETE_DOCUMENT) && <Popup
            content="Delete Document"
            trigger={
              <Button
                icon="trash"
                size="medium"
                onClick={() => {
                  onClickDeleteButton(row._id);
                  
                }}
              />
            }
          />
            }
            {
                hasAccess(ADD_NOTES) && <Popup
                    content="Add Notes"
                    trigger={
                    <Button
                        icon="add"
                        size="medium"
                        onClick={() => {
                        setVisible(true);
                        setDocumentId(row._id);
                        }}
                    />
                    }
                />
            }
            {
            row?.syncWithOtm && hasAccess(VIEW_STATUS) && <div style={{position:"relative"}}>
                    <Popup
                        content="View Status"
                        trigger={
                            <Button
                                icon="list alternate outline"
                                size="medium"
                                onClick={() => {
                                setViewStatusModal(true);
                                setDocumentId(row._id);
                                // getJobByDocumentId(row._id)
                                setDocObj(row)
                                }}
                            />
                        }
                    /> 
                { 
                    (row?.errorCount > 0) &&<Label style={{padding:'1px 6px', width:`${(row?.errorCount.toString().length >1) ? "65%" :"50%" }`}} color='red' className='badge'>
                    <p> {row?.errorCount}
                    </p>
                </Label>
                }
        </div>
            }
        </div>
      ),
      width: '20%',
    },
  ];

  const onChangeDocumentType = (e, data) => {
    setDocumentType(data.value)
  }

  useEffect(() => {
    setDocumentType("")
    if (carrierType === "air" || carrierType === "ocean") {
      setDocumentTypeOption([...documentOptions.filter(item=> item.type == carrierType)])
    }else{
      setDocumentTypeOption([...documentOptions])
    }
    setShippingLineId("")
  }, [carrierType])
  

     useEffect(() => {
            if (!shippingLineId) {
                setSelectedShippingLineName(false)
            }
        }, [shippingLineId])

  useEffect(() => {

    if (search?.trim() && selectedShippingLineName && documentType) {
    setParams({ page: page, limit: limit, search: search, type :documentType ,shippingline:selectedShippingLineName})
    }else if (search?.trim() && documentType) {
    setParams({ page: page, limit: limit, search: search, type :documentType })
    } else if (search?.trim() && selectedShippingLineName) {
    setParams({ page: page, limit: limit, search: search, shippingline:selectedShippingLineName })
    } else if (search?.trim()) {
    setParams({ page: page, limit: limit, search: search })
    }else if (selectedShippingLineName && documentType) {
    setParams({ page: page, limit: limit ,shippingline:selectedShippingLineName,type: documentType})   
    } else if (documentType) {
    setParams({ page: page, limit: limit, type: documentType })
    } else if (selectedShippingLineName) {
    setParams({ page: page, limit: limit, shippingline: selectedShippingLineName })
    }else {
    setParams({ page: page, limit: limit })
    }
  }, [page, limit, search,documentType,selectedShippingLineName]);

    useEffect(() => {
      getAllDocuments(shippingLineId, documentType, fromDate, toDate,selectedNodePath,carrierType)
    }, [page,limit])
    

  const dependencies = [search];
  useDebounce(() => {
    getAllDocuments(shippingLineId, documentType, fromDate, toDate,selectedNodePath,carrierType);
  }, 300, dependencies);

     const downloadCSV = (sheetData) => {
        const flattenedData = sheetData.map(item =>{
        let result = []
        for (let i = 0; i < sheetData.length; i++) {
            result.length = sheetData.length
            let count = 0, total = sheetData[i]?.fieldsAndValues
            for (let j = 0; j < total?.length; j++) {
                if ((total[j]?.fieldValue) != null && (((typeof (total[j]?.fieldValue) == 'string') && (total[j].fieldValue.trim() != "")) || ((typeof (total[j]?.fieldValue) == 'object') && total[j]?.fieldValue?.length > 0))) {
                    count = count + 1
                }
            }
            result[i] = { id: sheetData[i]._id, filledFields: count, totalFields: total?.length }
        }

        const calculatePercentage = (rowId) => {
            let found = result?.find(item => (item.id == rowId))
            if (found && ((found.filledFields / found.totalFields) * 100)) {
                return `${((found.filledFields / found.totalFields) * 100).toFixed()}%`
            } else {
                return `00%`
            }
        }
        const showRemainingFeildsForSheet = (rowId) => {
            let found = result?.find(item => (item.id == rowId))
            if (found) {
                return `${found.filledFields}/${found.totalFields.toFixed(0)}`
            }
        }
        const getBlNo = (fieldsAndValues) => {
            if (fieldsAndValues) {
                let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
                if (found[0]) return found[0].fieldValue
            }
            return ''
        }
        return {
            'Id': item.seqId,
            'Document Number': item.documentNo,
            'Location': item.domainName || '---',
            'BL Number': getBlNo(item.fieldsAndValues) || '---',
            'BL Type': item.stageType || '---',
            'Document Type': item.documentType || '---',
            'Carrier Line': item.shippingLine.name || '---',
            'Carrier Type': item.shippingLine.type || '---',
            'Order Type GID': item.orderTypeGid,
            'Extraction %': calculatePercentage(item._id) ,
            'Extraction Ratio':  showRemainingFeildsForSheet(item._id),
            'Assign To': item.assignToUser.name || '---',
            'Uploaded By': item.user.name || '---',
            'ERP SYNC DONE': item.syncWithOtm ? "Yes" : "No",
            // 'Uploaded On': moment(item?.createdAt).format('DD/MM/YYYY HH:mm A')
            'Uploaded On': moment(item?.createdAt).format('lll')
        }});
        const csv = Papa.unparse(flattenedData,{quotes: true,header: true,});
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Documents data.csv';
        a.click();

        URL.revokeObjectURL(url);
    };

    const getAllDocumentsForExport = async (shippingLine, documentType, fromDate, toDate,selectedNodePath,carrierType) => {
    try {
    // let res = await apiGET(`/v1/documents/list`);
    let res
      if (search || shippingLine || documentType || fromDate || toDate || selectedNodePath || carrierType) {
        const payload = {
          search: {
            searchTxt: search.trim(),
            shippingLineId: shippingLine,
            documentType: documentType,
            fromDate: fromDate,
            toDate: toDate,
            domainName: selectedNodePath,
            carrierType:carrierType
          }
        }
        const queryParams = objectToQueryParam(payload)

          res = await apiGET(`/v1/documents?${queryParams}&limit=${totalRows}&page=${page}`)
      }
      else {
          res = await apiGET(`/v1/documents/?limit=${limit}&page=${page}`,);
      }
    if (res.status === 200) {
        let response = res?.data?.data.data
        downloadCSV(response)
      }
    else {
        Swal.fire({
          title: "Error!",
          text: res?.data?.data || "Something went wrong!",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error || "Something went wrong!",
        icon: "error",
      });
    }
   };

  return (
    <>
      <Sidebar.Pushable>
        <Sidebar
          style={{
            width: 700,
          }}
          as={'div'}
          animation="overlay"
          icon="labeled"
          direction="right"
          onHide={() => {
            setVisible(false)
          }}
          onHidden={() => navigate('/dashboard/document-list')}
          vertical={'vertical'}
          visible={visible}>
          <Documentnotes setVisible={setVisible} documentId={documentId} visible={visible} />
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
            onHidden={() => navigate(`/dashboard/document-list`)}
            vertical={'vertical'}
            visible={viewStatusModal}>
            <StatusView 
            modal={viewStatusModal}
             blNo={getBlNo(docObj.fieldsAndValues)} modalOpen={setViewStatusModal} getAllDocuments={getAllDocuments} 
             documentId={documentId} docNo={docObj?.documentNo}   />
      </Sidebar>
        <Sidebar.Pusher dimmed={visible?visible:viewStatusModal} className="fadeIn">
          <div className="page-header" >
            <div>
              <Breadcrumb icon="right angle" sections={sections} />
              <div className="header-text">All document list</div>
              <div className="sub-text">List of all document List</div>
            </div>
            <div className="page-header-actions">
              <div style={{ display: "flex", alignItems: "center", marginRight: "2rem" }}>
                <strong>REFRESH</strong>
                <p style={{ marginLeft: "1rem", cursor: "pointer" }}><Icon onClick={() => {
                  getAllDocuments(shippingLineId, documentType, fromDate, toDate,selectedNodePath,carrierType)
                }} className='ui right aligned blue' name="refresh"></Icon></p>
              </div>
              {/* <Button
                style={{display:"flex",marginLeft:"1rem"}}
                primary
                onClick={() => {
                getAllDocuments(shippingLineId, documentType, fromDate, toDate)
                }}>
                <span>Refresh</span>
                <Icon className='ui right aligned' name="refresh"></Icon>
        </Button> */}
              <Input icon='search' placeholder='BL Number | Booking Number'
                value={search || ''}
                style={{ height: 37, marginRight: 17, width: '100%' }}
                onChange={handleInputChange}
              />
              <Button
                style={{ display: "flex", marginRight: "1rem", height: 37 ,alignItems:'center',width:'100%'}}
                onClick={() => {
                  setFilterModalOpen(false)
                  setShippingLineId('')
                  setDocumentType('')
                  setFromDate('')
                  setToDate('')
                  setSearch('')
                  setSelectedNodePath([])
                  getAllDocuments()
                  setCheckDropDown(false)
                  setSelectedShippingLineName("")
                  setCarrierType("all")
                }}>
                Clear Filter
              </Button>
              <Dropdown
                text='Filter'
                icon='filter'

                floating
                labeled
                button
                className='icon custom-dropdown'
                onClick={() => {
                  setFilterModalOpen(true)
                }}
              ></Dropdown>
            {
                hasAccess(EXPORT_DOCUMENTS) &&
                <Button
                    style={{display: "flex",gap:'10px',padding:'12px 10px',marginLeft:10}}
                    onClick={()=> getAllDocumentsForExport(shippingLineId, documentType, fromDate, toDate,selectedNodePath,carrierType)}
                    >
               <span>export</span> <Icon style={{color:"green", margin:0}} name="file excel outline"/> 
              </Button>
            }
            </div>
          </div>
          <TableWrapper
            columns={columns}
            data={documentsdata}
            progressPending={loading}
            paginationServer
            // onRowClicked={(rowData) => {
            //   onClickViewDocuments(rowData)
            // }}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={(newLimit, page) => {
              setLimit(newLimit);
            }}
            paginationPerPage={limit}
            paginationDefaultPage={page}
            onChangePage={(p) => setPage(p)}
            // role={authContext.user.role}
          />

        </Sidebar.Pusher>

        <Modal
          closeIcon
          onClose={() => setModalOpen(false)}
          onOpen={() => setModalOpen(true)}
          open={modalOpen}
        // trigger={documentsdata.length > 0 && !loading ? <Icon name="eye" size='large'></Icon> : null}
        >
          <Modal.Header>Document Details</Modal.Header>
          <Modal.Content>
            <Table celled striped>
              <Table.Body>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Location</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.domainName}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Shipping Line</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.shippingLine?.name}</Table.Cell>
                </Table.Row>
                {/* <Table.Row>
                <Table.Cell >
                  <Header as='h5'>Booking Number</Header>
                </Table.Cell>
                <Table.Cell>{shippingLineData?.bookingNo}</Table.Cell>
              </Table.Row> */}
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Document Number</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.documentNo}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Document Type</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.documentType}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Shipment Type</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.document}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Document URL</Header>
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => {
                      // onClickViewDocuments(shippingLineData.documentUrl)
                      onClickViewDocuments(shippingLineData)
                    }} size='mini'
                    >View Document</Button>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Document Uploaded By</Header>
                  </Table.Cell>
                  <Table.Cell>{shippingLineData?.user?.name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell >
                    <Header as='h5'>Created On</Header>
                  </Table.Cell>
                  <Table.Cell>{moment(shippingLineData?.createdAt).format('YYYY')}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Modal.Content>
        </Modal>

        <Modal
          style={{width:"75%"}}
          closeIcon
          onClose={() => setFilterModalOpen(false)}
          onOpen={() => setFilterModalOpen(true)}
          open={filterModalOpen}
        >
          <Modal.Header>Filters</Modal.Header>
          <Modal.Content>
            <div style={{ display: 'flex' }}>
              <div style={{marginRight:10}}>
                <div style={{ marginBottom: 7 }}>
                  <label className='container-count-text'>Select Mode</label>
                </div>
                <Dropdown
                 placeholder="Select Mode"
                 options={carrierTypeOption || []}
                 required={true}
                 selection
                 onFocus={() => {
                   setErrorObj();
                 }}
                 value={carrierType}
                 onChange={(e, data) => {
                  setCarrierType(data.value);
                 }}
               />
              </div>
              <div>
                <div style={{ marginBottom: 7}}>
                  <label className='container-count-text' >Select Carrier</label>
                </div>
                <ShippingLineNameDropdown
                  shippingLineId={setShippingLineId} shippingId={shippingLineId} setSelectedShippingLineName={setSelectedShippingLineName}
                  type={carrierType}
                />
              </div>
              <div>
                <div style={{ marginBottom: 7 }}>
                  <label className='container-count-text'>Select Document Type</label>
                </div>
                <Dropdown
                  clearable
                  search
                  selection
                  options={documentTypeOption}
                  onChange={onChangeDocumentType}
                  placeholder='Select Document Type'
                  value={documentType}
                />
                
              </div>
              <div style={{ marginLeft: 10 }}>
                <DateRangeFilter
                  fromDat={fromDate}
                  toDat={toDate}
                  fromDate={setFromDate}
                  toDate={setToDate}
                />
              </div>
              
            </div>
            <div style={{marginTop:5}}>
              <label className='container-count-text'>Select Domain</label>
            </div>
            <div >
                <NestedDomain nodePathFn={setSelectedNodePath} />
                <div style={{ marginTop: 12 }}>
                  {selectedNodePath?.length > 0 && (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        Path : {selectedNodePath?.map(item=> <Label color="gray" style={{marginTop:2}} horizontal>
                  {item}
                </Label>)}
                    </div>
                  )}
                </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button color='gray' onClick={() => {
              setFilterModalOpen(false)
              setShippingLineId('')
              setDocumentType('')
              setFromDate('')
              setToDate('')
              setSelectedNodePath([])
              getAllDocuments()
              setCheckDropDown(false)
              setSelectedShippingLineName("")
              setCarrierType("all")
            }}>
              Clear
            </Button>
            <Button color='gray' onClick={() => {
              setFilterModalOpen(false);
              getAllDocuments(shippingLineId, documentType, fromDate, toDate,selectedNodePath,carrierType);
            }}>
              Apply
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar.Pushable>
    </>
  );
}

export default DocumentList;

