import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';
import AddRole from './addRole';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';
import { ADD_ROLE, DELETE_ROLE, EDIT_ROLE, hasAccess } from '../../utils/accessHelper';

function RoleList() {
    const navigate = useNavigate()
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = React.useState(action == 'add');
    const [role, setRole] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const queryLimit = params.get('limit');
    const queryPage = params.get('page');
    const querySearch = params.get('search');
    const [page, setPage] = useState(queryPage || 1);
    const [search, setSearch] = useState(querySearch ||'')
    const [limit, setLimit] = useState(queryLimit || 10);
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const validInputRegex = /^[a-zA-Z0-9\s]*$/
    const {user} = useContext(AuthContext)

    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Manage List', content: 'Manage Role', active: true },
    ];

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

    const onClickEditButton = (id) => {
        navigate(`/dashboard/manage-role/edit/${id}`);
    }
    useEffect(() => {
        document.title = "Admin Panel | Role"
    }, [])


    const onClickDeleteButton = async (id) => {
        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'Want to delete this Role?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const response = await apiPUT(`v1/role/${id}`)
                    if (response.status === 200) {
                        Toast.fire("Success!","Role Deleted successfully", 'success');
                        getAllRoles()
                    }
                    else {
                        Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
                    }
                }
            } catch (error) {
                Toast.fire('Error!', error || 'Something went wrong!', 'error');
            }
        });
    }


    useEffect(() => {
        if (action == 'add' || action == 'edit') {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [action]);

    const getAllRoles = async (fromDate, toDate) => {
        try {
            setLoading(true);
            let response;
            if (search || (fromDate && toDate)) {
                const payload = {
                    search: {
                        name: search,
                        fromDate: fromDate,
                        toDate: toDate
                    }
                }
                const queryParams = objectToQueryParam(payload)
                response = await apiGET(`/v1/role?${queryParams}&limit=${limit}&page=${page}`)
            }
            else {
                response = await apiGET(`/v1/role?page=${page}&limit=${limit}`);
            }
            setLoading(false);

            if (response.status === 200) {
                setRole(response?.data?.data?.data);
                setTotalRows(response?.data?.data?.totalCount);
                setLimit(response?.data?.data?.limit)
                setPage(response?.data?.data?.page)
            }
            else {
                Toast.fire('Error!', response?.data?.data || 'Something went wrong!', 'error');
            }
        } catch (error) {
            Toast.fire('Error!', error || 'Something went wrong!', 'error');
        }
    };


    const columns = [
        {
            name: 'Name',
            selector: (row) => row?.name,
            width: "20%"
        },
        {
            name: 'Description',
            selector: (row) => row?.description
        },
        // {
        //     name: 'Disabled Modules',
        //     selector: (row) => '{disabledModules}',
        // },
        // {
        //     name: 'Created By',
        //     selector: (row) => row?.createdUser?.name || "",
        // },
        // {
        //     name: 'Updated By',
        //     selector: (row) => row?.updatedUser?.name || "",
        // },
        {
            name: 'Created On',
            selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('HH:mm a')}</>,
            // selector: (row) => log,
        },
        {
            name: 'Updated On',
            selector: (row) => row && <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('HH:mm a')}</>,
        },
        {
            name: 'Action',
            selector: (row) => (
                <div className='flex gap-2'>
            { 
                hasAccess(EDIT_ROLE) && <button className="ui blue icon button basic" onClick={() => onClickEditButton(row._id)}>
                <i className="edit icon"></i>
            </button>
            }
            {
                hasAccess(DELETE_ROLE) && <button className="ui red icon button basic" onClick={() => onClickDeleteButton(row._id)}>
                    <i className="trash icon"></i>
                </button>
            }
        </div>
            )
            ,
        },
    ];

    const dependecies = [search]
    useDebounce(() => { getAllRoles() }, 300, dependecies);

    useEffect(() => {
        getAllRoles(fromDate, toDate);
        if (search) {
            setParams({page:page,limit:limit,search:search})
        }else{
            setParams({page:page,limit:limit})
        }
    }, [page, limit,search]);

    return (
        <>

            <Sidebar.Pushable>
                <Sidebar
                    style={{
                        width: 900,
                    }}
                    as={'div'}
                    animation="overlay"
                    icon="labeled"
                    direction="right"
                    onHide={() => setVisible(false)}
                    onHidden={() => navigate('/dashboard/manage-role')}
                    vertical={'vertical'}
                    visible={visible}>
                    <AddRole
                        visible={visible}
                        getAllRoles={getAllRoles}
                    />
                </Sidebar>
                <Sidebar.Pusher dimmed={visible} className="fadeIn">
                    <div className="page-header">
                        <div>
                            <Breadcrumb icon="right angle" sections={sections} />
                            <div className="header-text">All Role list</div>
                            <div className="sub-text">List of all Role List</div>
                        </div>
                        <div className="page-header-actions">

                            <Input icon='search' placeholder='Name | Short code'
                                value={search || ''}
                                style={{ marginRight: '10px', height: 37 }}
                                onChange={(e,{value}) => {
                                    if (value === "" | validInputRegex.test(value)) {
                                        setSearch(value)
                                    }else{
                                        console.log("Validation: No special characters allowed");
                                    }
                                }} />
                            <div style={{ marginRight: 7 }}>
                                <Dropdown
                                    text='Filter'
                                    icon='filter'
                                    floating
                                    labeled
                                    button
                                    style={{borderRadius:'20px'}}
                                    className='icon'
                                    onClick={() => {
                                        setFilterModalOpen(true)
                                    }}
                                ></Dropdown>
                            </div>
                        {
                                hasAccess(ADD_ROLE) &&  <Button
                                style={{borderRadius:'20px'}}
                                primary
                                onClick={() => {
                                    navigate('/dashboard/manage-role/add');
                                }}>
                                Add Role
                            </Button>
                        }
                        </div>
                    </div>
                    <TableWrapper
                        columns={columns}
                        data={role}
                        progressPending={loading}
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={(newLimit, page) => {
                          setLimit(newLimit);        
                        }}
                        paginationPerPage={limit}
                        paginationDefaultPage={page}
                        onChangePage={(p) => setPage(p)}
                    />
                </Sidebar.Pusher>
            </Sidebar.Pushable>
            <Modal
                closeIcon
                onClose={() => setFilterModalOpen(false)}
                onOpen={() => setFilterModalOpen(true)}
                open={filterModalOpen}
                style={{ padding: '10px', borderRadius: '20px' }}

            >
                <Modal.Header>Date Filter</Modal.Header>
                <Modal.Content>
                    <div style={{ marginTop: 10 }}>
                        <DateRangeFilter
                            fromDat={fromDate}
                            toDat={toDate}
                            fromDate={setFromDate}
                            toDate={setToDate}
                        />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='gray' onClick={() => {
                        setFromDate('')
                        setToDate('')
                        setFilterModalOpen(false)
                        getAllRoles();
                    }}>
                        Clear Filter
                    </Button>
                    <Button color='gray' onClick={() => {
                        setFilterModalOpen(false);
                        getAllRoles(fromDate, toDate);
                    }}>
                        Apply
                    </Button>
                </Modal.Actions>
            </Modal>
        </>

    );

}

export default RoleList;
