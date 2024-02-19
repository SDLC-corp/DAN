import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Label, List, Popup, Sidebar, Tab } from 'semantic-ui-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, apiPUT } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';

function RequestedDocumentList() {

  const navigate = useNavigate();
  let { action } = useParams();
  const [visible, setVisible] = React.useState(action == 'approved');
  const [requestedDocumentList, setRequestedDocumentList] = useState([])
  const [deletedDoc, setDeletedDoc] = useState([])
  const [totalRows, setTotalRows] = useState(0);
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  let loggedInUser = JSON.parse(localStorage.getItem("user"))

  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'Delete Request List', content: ' Delete Request List', active: true },
  ];

  //Delete Document By Doc Id
  const onClickDeleteButton = async (id) => {
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
            allRequestedDocumentList()
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

  //get All Requested Document 
  const allRequestedDocumentList = async () => {
    try {
      const response = await apiGET(`/v1/approved?limit=${limit}&page=${page}`,);
      if (response.status === 200) {
        setVisible(false)
        const deletedDocuments = response?.data?.data?.data.filter(doc => {
          return doc.isDeleted
        });
        const nonDeletedDocuments = response?.data?.data?.data.filter(doc => {
          return !doc.isDeleted
        });

        setRequestedDocumentList(nonDeletedDocuments)
        setDeletedDoc(deletedDocuments)
      }
      else if (response.status === 400) {
        Swal.fire({
          title: "Error!",
          text: "Something get Wrong",
          icon: "error",
        });

      } else {
        Swal.fire({
          title: "Error!",
          text: "Something get Wrong",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  //get get document By Requested user
  const getDocumentslistByRequestedUser = async () => {
    try {
      const requestedUserIdResult = await apiGET(`/v1/approved/user?requesteduserid=${loggedInUser.id}`)
      if (requestedUserIdResult.status === 200) {
        setVisible(false)
        const deletedDocuments = requestedUserIdResult?.data?.data?.data.filter(doc => {
          return doc.isDeleted
        });
        const nonDeletedDocuments = requestedUserIdResult?.data?.data?.data.filter(doc => {
          return !doc.isDeleted
        });

        setRequestedDocumentList(nonDeletedDocuments)
        setDeletedDoc(deletedDocuments)
      }
      else if (response.status === 400) {
        Swal.fire({
          title: "Error!",
          text: "Something get Wrong",
          icon: "error",
        });

      } else {
        Swal.fire({
          title: "Error!",
          text: "Something get Wrong",
          icon: "error",
        });
      }
    }
    catch (error) {
      console.log("ERrror", error);
    }
  }

  //Approved to Delete Document
  const approvedToRequestedDocument = async (id) => {
    try {
      const response = await apiPUT(`/v1/approved/approve-document/${id}`);
      if (response.status === 200) {
        setVisible(false)
        allRequestedDocumentList()
        navigate('/dashboard/document/deleterequest')
        Swal.fire({
          title: "Success",
          text: "Request Approved Successfully",
          icon: "success",
        });
      } else if (response.status === 400) {
        Swal.fire({
          title: "Error!",
          // text: response?.data?.data,
          icon: "error",
        });

      } else {
        Swal.fire({
          title: "Error!",
          // text: response?.data?.data,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const getBlNo = (fieldsAndValues) => {
    if (fieldsAndValues) {
      let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
      if (found[0]) return found[0].fieldValue
    }
    return ''
  }

  const panes = [
    {
      menuItem: 'Pending',
      value: "pending"
    },
    {
      menuItem: 'Deleted',
      value: "deleted"
    },
  ]

  const pendingRequestColumns = [
    {
      name: <p>Document No. / Location</p>,
      selector: (row) =>
        row && (
          <Link style={{ color: "black" }} to={`/dashboard/studio/${row._id}`}>
            <p>
              <strong>{row && row?.documentsDetails[0]?.documentNo}</strong>
            </p>
            <>{row && row?.documentsDetails[0]?.domainName}</>
          </Link>
        ),
      width: '16%',
    },
    {
      name: <p>B/L No. / B/L Type</p>,
      selector: (row) => (row &&
        <>
          <Popup
            trigger={
              <p data-tip={getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}>{getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}
              </p>
            }
            content={getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}
            position="top center"
          />

          <>{row?.stageType}</>
        </>
      ),
    },
    {
      name: <p>Document Info</p>,
      cell: (row) => (
        <div>
          <div> {row && `${row?.documentsDetails[0]?.documentType}/${row?.documentsDetails[0]?.orderTypeGid?.split(".")[1] || ''}`}</div>
        </div>
      ),
      width: '10%',
    },
    {
      name: 'Requested By',
      selector: (row) => row.userDetails[0]?.name,
    },
    {
      name: 'Requested On',
      selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('HH:mm a')}</>,
    },
    {
      name: 'Status',
      selector: (row) => <List style={{ marginTop: 5 }}>
        <List.Item>
          <Label color="Gray" horizontal>
            Pending
          </Label>
        </List.Item>
      </List>,
    },

    {
      name: 'Action',
      cell: (row) => (
        <div style={{ display: 'flex', width: '40%', justifyContent: 'space-between' }}>
          {
            loggedInUser.id != row.requestedBy ?
              <Button color='blue'
                size={'mini'}
                onClick={() => { onClickDeleteButton(row.documentId) }}>
                Approve
              </Button>
              :
              <div style={{ marginLeft: 5 }}>
                ---
              </div>
          }

        </div>
      ),
      width: '25%',
    },

  ];

  const deletedDocColumns = [
    {
      name: <p>Document No. / Location</p>,
      selector: (row) =>
        row && (
          <>
            <p>
              <strong>{row && row?.documentsDetails[0]?.documentNo}</strong>
            </p>
            <>{row && row?.documentsDetails[0]?.domainName}</>
          </>
        ),
      width: '16%',
    },
    {
      name: <p>B/L No. / B/L Type</p>,
      selector: (row) => (row &&
        <>
          <Popup
            trigger={
              <p data-tip={getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}>{getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}
              </p>
            }
            content={getBlNo(row?.documentsDetails[0]?.fieldsAndValues)}
            position="top center"
          />

          <>{row?.stageType}</>
        </>
      ),
    },
    {
      name: <p>Document Info</p>,
      cell: (row) => (
        <div>
          <div> {row && `${row?.documentsDetails[0]?.documentType}/${row?.documentsDetails[0]?.orderTypeGid?.split(".")[1] || ''}`}</div>
        </div>
      ),
      width: '10%',
    },
    {
      name: 'Deleted By',
      selector: (row) => row?.deleteUserDetails[0]?.name,
    },
    {
      name: 'Deleted On',
      selector: (row) => row && <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('HH:mm a')}</>,
    },
    {
      name: 'Requested By',
      selector: (row) => row.userDetails[0]?.name,
    },
    {
      name: 'Requested On',
      selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('HH:mm a')}</>,
    },

    {
      name: 'Status',
      selector: (row) => row.isDeleted ?
        <List style={{ marginTop: 5 }}>
          <List.Item>
            <Label color="red" horizontal>
              Deleted
            </Label>
          </List.Item>
        </List>
        : null,
    },


  ];

  useEffect(() => {
    if (loggedInUser.role === 'superAdmin' || loggedInUser.role === 'admin') {
      allRequestedDocumentList()
    }
    else {
      getDocumentslistByRequestedUser()
    }
  }, [])

  const handleTabChangeShippingLine = (e, { activeIndex }) => {
    if (activeIndex == 0) {
      setActiveTab("pending")
    } else {
      setActiveTab("deleted")
    }
  }

  return (
    <Sidebar.Pushable>
      <Sidebar.Pusher dimmed={visible} className="fadeIn">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">Delete request list</div>
            <div className="sub-text">Delete request list</div>
          </div>
          <div className="page-header-actions">
          </div>
        </div>
        <Tab menu={{ secondary: true, pointing: true }} panes={panes}
          onTabChange={handleTabChangeShippingLine} />
        <TableWrapper
          columns={activeTab == "pending" ? pendingRequestColumns : deletedDocColumns}
          data={activeTab == "pending" ? requestedDocumentList : deletedDoc}
          progressPending={loading}
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={(newLimit, page) => {
            setLimit(newLimit);
          }}
          paginationPerPage={limit}
          onChangePage={(p) => setPage(p)}
        />
      </Sidebar.Pusher>
    </Sidebar.Pushable>

  );
}

export default RequestedDocumentList;
