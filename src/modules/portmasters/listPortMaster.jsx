import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiDELETE, apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import AddPortMaster from './addPortMaster';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';
import { ADD_PORT_MASTERS, DELETE_PORT_MASTERS, EDIT_PORT_MASTERS, hasAccess } from '../../utils/accessHelper';

function ListPortMaster() {
    const navigate = useNavigate()
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = React.useState(action == 'add');
    const [portMaster, setPortMasterList] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const queryLimit = params.get('limit');
    const queryPage = params.get('page');
    const querySearch = params.get('search');
    const [page, setPage] = useState(queryPage || 1);
    const [search, setSearch] = useState(querySearch || '')
    const [limit, setLimit] = useState(queryLimit || 10);
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [syncLoading, setSyncLoading] = useState(false)
    const validInputRegex = /^[a-zA-Z0-9\s/_.]*$/
    const { user } = useContext(AuthContext)


    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Port Master List', content: 'Port Master List', active: true },
    ];


    const onClickEditButton = (id) => {
        navigate(`/dashboard/portmaster/edit/${id}`);
    }
    useEffect(() => {
        document.title = "Admin Panel | Port Master"
    }, [])


    const onClickDeleteButton = async (id) => {
        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'Want to delete this port master?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const response = await apiDELETE(`v1/portmaster/${id}`)
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Success!",
                            text: "Port Master Deleted successfully",
                            icon: "success",
                        });
                        getPortMasterList()
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
        if (action == 'add' || action == 'edit') {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [action]);

    const getPortMasterList = async (fromDate, toDate) => {
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
                response = await apiGET(`/v1/portmaster/list?${queryParams}&limit=${limit}&page=${page}`)
            }
            else {
                response = await apiGET(`/v1/portmaster/list/?page=${page}&limit=${limit}`);
            }
            setLoading(false);
            if (response.status === 200) {
                setPortMasterList(response?.data?.data?.data);
                setTotalRows(response?.data?.data?.totalCount);
                // setLimit(response?.data?.data?.limit)
                // setPage(response?.data?.data?.page)
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
    const getSyncPortMasterList = async () => {
        try {
            setSyncLoading(true);
            let response = await apiGET(`/v1/portmaster/syncport`);
            setSyncLoading(false);
                console.log('response sync port',response);
            if (response.status === 200) {
                getPortMasterList()
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


    const columns = [
        {
            name: '#',
            selector: (row) => row?.seqId,
            // width: "10%"
        },
        {
            name: 'LocationXid',
            selector: (row) => row?.locationXid,
        },
        {
            name: 'LocationGid',
            selector: (row) => row?.locationGid
        },
        {
            name: 'LocationName',
            selector: (row) => row?.locationName,
        },
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
                hasAccess(EDIT_PORT_MASTERS) && <button className="ui blue icon button basic" onClick={() => onClickEditButton(row._id)}>
                <i className="edit icon"></i>
            </button>
            }
            {
               hasAccess(DELETE_PORT_MASTERS) && <button className="ui red icon button basic" onClick={() => onClickDeleteButton(row._id)}>
                    <i className="trash icon"></i>
                </button>
            }
        </div>
            )
            ,
        },
    ];


    const dependecies = [search]
    useDebounce(() => { getPortMasterList() }, 300, dependecies);

    useEffect(() => {
        getPortMasterList(fromDate, toDate);
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
                    onHidden={() => navigate('/dashboard/portmaster')}
                    vertical={'vertical'}
                    visible={visible}>
                    <AddPortMaster
                        visible={visible}
                        getPortMasterList={getPortMasterList}
                    />
                </Sidebar>
                <Sidebar.Pusher dimmed={visible} className="fadeIn">
                    <div className="page-header">
                        <div>
                            <Breadcrumb icon="right angle" sections={sections} />
                            <div className="header-text">All Port Master list</div>
                            <div className="sub-text">List of all Port Master List</div>
                        </div>
                        <div className="page-header-actions">
                            <Button
                                className={`${syncLoading ? 'loading':""}`}
                                onClick={()=>getSyncPortMasterList()}>
                                Sync Port 
                            </Button>
                            <Input icon='search' placeholder='locationName | locationXid | locationGid'
                                value={search || ''}
                                style={{ marginRight: '10px', height: 37 }}
                                onChange={(e) => {
                                    let inputValue = e.target.value
                                    if (inputValue === '' || validInputRegex.test(inputValue)) {
                                        setSearch(inputValue)
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
                                    className='icon'
                                    onClick={() => {
                                        setFilterModalOpen(true)
                                    }}
                                ></Dropdown>
                            </div>
                        {
                            hasAccess(ADD_PORT_MASTERS) &&<Button
                                primary
                                onClick={() => {
                                    navigate('/dashboard/portmaster/add');
                                }}>
                                Add Port
                            </Button>
                        }
                        </div>
                    </div>
                    <TableWrapper
                        columns={columns}
                        data={portMaster}
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
                        getPortMasterList();
                    }}>
                        Clear Filter
                    </Button>
                    <Button color='gray' onClick={() => {
                        setFilterModalOpen(false);
                        getPortMasterList(fromDate, toDate);
                    }}>
                        Apply
                    </Button>
                </Modal.Actions>
            </Modal>
        </>

    );

}

export default ListPortMaster;
