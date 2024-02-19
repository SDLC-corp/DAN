import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Icon, Image, Input, Label, List, Modal, Radio, Sidebar } from 'semantic-ui-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import AddUser from './addUser';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import moment from 'moment';
import DEFAULTIMG from '../../assets/images/default.png';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import useDebounce from '../../utils/useDebounce';
import { AuthContext } from '../../contexts';
import { useContext } from 'react';
import NestedDomain from '../../components/nodetree/nestedDomain';
import { ADD_USER, EDIT_USER, VIEW_USER, hasAccess } from '../../utils/accessHelper';


function UserList(props) {

  const { state } = useLocation()
  const navigate = useNavigate();
  let { action } = useParams();
  const [params, setParams] = useSearchParams()
  const queryLimit = params.get('limit');
  const queryPage = params.get('page');
  const querySearchFilter = params.get('search');
  const [visible, setVisible] = React.useState(action == 'add');
  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(+queryPage || 1);
  const [limit, setLimit] = useState(+queryLimit || 10);
  const [search, setSearch] = useState(querySearchFilter || '')
  const [ViewUser, setViewUser] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [role, setRole] = useState('')
  const [selectedNodePath, setSelectedNodePath] = useState([]);
  const validInputRegex = /^[a-zA-Z0-9\s@.]*$/

  let {user} = useContext(AuthContext);

  const getAllUsers = async (fromDate,toDate,selectedNodePath,role) => {
    setLoading(true);
    try {
      let response;
      if (search || (fromDate && toDate) || selectedNodePath || role) {
        const payload = {
          search: {
            name: search,
            fromDate: fromDate,
            toDate: toDate,
            domainName:selectedNodePath,
            role:role
          }
        }
        const queryParams = objectToQueryParam(payload)
          response = await apiGET(`/v1/users?${queryParams}&limit=${limit}&page=${page}`)
      }
      else {
          response = await apiGET(`/v1/users?limit=${limit}&page=${page}`,);
      }
      if (response.status === 200) {
        setVisible(false)
        setUsers(response?.data?.data?.data);
          setTotalRows(response?.data?.data?.totalCount);
          setPage(response?.data?.data?.page)
          setLimit(response?.data?.data?.limit)
      } else if (response.status === 400) {
        Swal.fire({
          title: "Error!",
          text: response?.data?.data,
          icon: "error",
        });

      } else {
        Swal.fire({
          title: "Error!",
          text: response?.data?.data,
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
  };

  const onClickEditUser = async (id) => {
    navigate(`/dashboard/users/edit/${id}`);
  }

  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'User List', content: 'User List', active: true },
  ];

  const columns = [
    {
      name: 'Name',
      selector: (row) => <div style={{ display: "flex", width: "140px", alignItems: "center" }}>
        <div >
          <Image src={row.profilePic == "/default.png" || row.profilePic == "" ? DEFAULTIMG : row.profilePic} size='mini' style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
        </div>
        <div style={{ marginLeft: "10px" }}>
          {row.name}
        </div>

      </div>
    },
    {
      name: 'Email',
      selector: (row) => row.email,
    },
    {
      name: 'Role',
      selector: (row) => row?.role?.name,
    },
    {
      name: 'Access Location',
    //   cell: (row) => (<div>
    //    { row?.domain ? row.domain.map((location)=><p data-tooltip={location} data-position="bottom center">
    //       {(location.length > 20) ? location.substring(0, 20) + "..." : location}
    //     </p>) : "--"}
    //     </div>
    //   ),
        cell: (row) => ( <List style={{ marginTop: 5 }}>
                    {Array.isArray(row.domain) && row.domain?.map((location)=><List.Item>
                <Label color="gray" horizontal data-tooltip={location}>
                  {location}
                </Label>
              </List.Item>
            ) }
            </List>
      ),
    },
    {
      name: 'Approver Location',
    //   cell: (row) => (<div>
    //    { row?.domain ? row.domain.map((location)=><p data-tooltip={location} data-position="bottom center">
    //       {(location.length > 20) ? location.substring(0, 20) + "..." : location}
    //     </p>) : "--"}
    //     </div>
    //   ),
        cell: (row) => ( <List style={{ marginTop: 5 }}>
                    {row.approvalDomain?.map((location)=><List.Item>
                <Label color="gray" horizontal data-tooltip={location}>
                  {location}
                </Label>
              </List.Item>
            ) }
            </List>
      ),
    },
    {
      name: 'Created On',
      selector: (row) => <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('HH:mm a')}</>,
    },
    {
      name: 'Updated On',
      selector: (row) => <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('HH:mm a')}</>,
    },
    {
      name: 'Action',
      cell: (row) => (
        <div>
            {
            hasAccess(EDIT_USER)  && <Button icon='edit' basic color='teal'
            onClick={() => { setVisible(true); onClickEditUser(row._id) }}></Button>
            }
            {
            hasAccess(VIEW_USER) && <Button icon='eye' onClick={() => {
            setViewUser(true)
            setVisible(true); onClickViewUser(row._id)
          }}
          ></Button>
            }
        </div>
      ),
    },
  ];

  const onClickViewUser = async (id) => {
    navigate(`/dashboard/users/View/${id}`);
  }


  useEffect(() => {
    if (action == 'add' || action === 'edit' || action === "View" || state?.actions || state?.closeSidebar) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [action || state?.actions || state?.closeSidebar]);

  useEffect(() => {
    getAllUsers(fromDate, toDate,selectedNodePath,role);
    setParams({page:page,limit:limit,search:search})
  }, [page, limit,search]);

  const dependencies = [search];
  useDebounce(() => {
    getAllUsers(fromDate,toDate,selectedNodePath,role);
  }, 300, dependencies);

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
            // setViewUser(false)           
            // setVisible(false) 
            // navigate(-1)
          }}
          onHidden={() => navigate('/dashboard/users')}
          vertical={'vertical'}
          visible={visible || state?.actions}>
          <AddUser ViewUser={ViewUser} setVisible={setVisible} visible={visible} stateAction={state?.actions}
            setViewUser={setViewUser}
            closeState={state?.closeSidebar} getAllUsers={getAllUsers} />
        </Sidebar>
        <Sidebar.Pusher dimmed={visible || state?.actions} className="fadeIn">
          <div className="page-header">
            <div>
              <Breadcrumb icon="right angle" sections={sections} />
              <div className="header-text">All Users</div>
              <div className="sub-text">List of all users in application</div>
            </div>
            <div className="page-header-actions">
                <Input
                  style={{ marginRight: '10px', height: 37 }}
                  icon='search'
                  placeholder="Search Name | Email "
                  type="text"
                  onChange={(e, { value }) =>{
                    if (value === "" | validInputRegex.test(value) ) {
                        setSearch(value)
                    }else{
                        console.log("Validation: No special characters allowed");
                    }
                }}
                  value={search}
                />
            <div style={{ marginRight: 7 }}>
              <Dropdown
                text='Filter'
                icon='filter'
                floating
                labeled
                button
                className='icon'
                onClick={() => {
                  setFilterModalOpen(true)
                }}
              ></Dropdown>
            </div>
                {
                hasAccess(ADD_USER) && <Button
                    primary
                    onClick={() => {
                    setVisible(true)
                    navigate('/dashboard/users/add');
                    }}>
                    Add User
                </Button>
                }
            </div>
          </div>
          <TableWrapper
            columns={columns}
            data={users}
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
      <Modal
        closeIcon
        onClose={() => setFilterModalOpen(false)}
        onOpen={() => setFilterModalOpen(true)}
        open={filterModalOpen}
      >
        <Modal.Header>Date Filter</Modal.Header>
        <Modal.Content>
          <div style={{display:'flex',justifyContent:'space-between',width:'70%'}}>
            <DateRangeFilter
              fromDat={fromDate}
              toDat={toDate}
              fromDate={setFromDate}
              toDate={setToDate}
            />
             <div>
             <div style={{marginBottom:6}}>
                <label className='container-count-text'>Select Role</label>
              </div>
              <Dropdown
                options={[{ text: "Superadmin", value: "superAdmin" }, { text: "Admin", value: 'admin' }, {
                  text: "Documentation",
                  value: 'documentation'
                }]}
                search
                selection
                clearable
                placeholder="Select Role"
                value={role}
                onChange={(e,data)=>{setRole(data.value)}}
              />
             </div>
          </div>
          <div style={{marginTop:10}}>
          <div>
                <label className='container-count-text'>Select Domain</label>
              </div>
              <div>
                <NestedDomain nodePathFn={setSelectedNodePath} />
                <div style={{ marginTop: 12 }}>
                  {selectedNodePath?.length > 0 && (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        Path : {selectedNodePath?.map(item=> <Label color="gray" style={{marginTop:2}} horizontal >
                  {item}
                </Label>)}
                    </div>
                  )}
                </div>
              </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button color='gray' onClick={() => {
            setFromDate('')
            setToDate('')
            setSelectedNodePath([])
            setFilterModalOpen(false)
            getAllUsers();
            setRole('')
          }}>
            Clear Filter
          </Button>
          <Button color='gray' onClick={() => {
            setFilterModalOpen(false);
            getAllUsers(fromDate, toDate,selectedNodePath,role);
          }}>
            Apply
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
export default UserList;
