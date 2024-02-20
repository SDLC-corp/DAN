import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Image, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import AddUser from './addUser';
import { apiGET, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import moment from 'moment';
import DEFAULTIMG from '../../assets/images/default.png';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import useDebounce from '../../utils/useDebounce';
import { ADD_USER, EDIT_USER, VIEW_USER, hasAccess } from '../../utils/accessHelper';


function UserList() {

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
  const [rolesDataOptions, setRolesDataOptions] = useState([])
  const validInputRegex = /^[a-zA-Z0-9\s@.]*$/


  const getAllUsers = async (search,fromDate,toDate,role) => {
    setLoading(true);
    try {
      let response;
      if (search || (fromDate && toDate) || role) {
        const payload = {
          search: {
            name: search,
            fromDate: fromDate,
            toDate: toDate,
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
          const result = response?.data?.data;
          setUsers(result?.data);
          setTotalRows(result?.totalCount);
          setPage(result?.page)
          setLimit(result?.limit)
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

  const getAllRoles = async () => {
    try {
        setLoading(true);
        let response = await apiGET(`/v1/role/all`)
        setLoading(false);
        if (response.status === 200) {
            const result = response?.data?.data?.data
            let list = result?.map(item => {
                return {key:item._id, text:item.name, value: item._id}
            })
            setRolesDataOptions([...list])
        }
        else {
            Swal.fire({
                title: "Error!",
                text: response?.data?.data || "Something went wrong!",
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

    useEffect(() => {
      getAllRoles()
    }, [])


  useEffect(() => {
    if (action == 'add' || action === 'edit' || action === "View" || state?.actions || state?.closeSidebar) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [action || state?.actions || state?.closeSidebar]);

  useEffect(() => {
    getAllUsers(search,fromDate,toDate,role);
    setParams({page:page,limit:limit,search:search})
  }, [page, limit,search]);

  const dependencies = [search];
  useDebounce(() => {
    getAllUsers(search,fromDate,toDate,role);
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
                options={rolesDataOptions}
                search
                selection
                clearable
                placeholder="Select Role"
                value={role}
                onChange={(e,data)=>{setRole(data.value)}}
              />
             </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button color='gray' onClick={() => {
            setFromDate('')
            setToDate('')
            setFilterModalOpen(false)
            getAllUsers();
            setRole('')
          }}>
            Clear Filter
          </Button>
          <Button color='gray' onClick={() => {
            setFilterModalOpen(false);
            getAllUsers(search,fromDate,toDate,role);
          }}>
            Apply
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
export default UserList;
