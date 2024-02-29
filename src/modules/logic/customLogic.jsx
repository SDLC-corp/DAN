import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';
import AddLogic from './addLogic';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';

function CustomLogic() {
    const navigate = useNavigate()
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = React.useState(action == 'add');
    const [logic, setLogic] = useState([]);
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


    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Custom List', content: 'Custom Logic', active: true },
    ];


    const onClickEditButton = (id) => {
        navigate(`/dashboard/custom-logic/edit/${id}`);
    }
    useEffect(() => {
        document.title = "Admin Panel | Logic"
    }, [])


    const onClickDeleteButton = async (id) => {
        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'Want to delete this Logic?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const response = await apiPUT(`v1/logic/${id}`)
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Success!",
                            text: "Logic Deleted successfully",
                            icon: "success",
                        });
                        getAllLogics()
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

    const getAllLogics = async (fromDate, toDate) => {
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
                response = await apiGET(`/v1/logic?${queryParams}&limit=${limit}&page=${page}`)
            }
            else {
                response = await apiGET(`/v1/logic?page=${page}&limit=${limit}`);
            }
            setLoading(false);

            if (response.status === 200) {
                setLogic(response?.data?.data?.data);
                setTotalRows(response?.data?.data?.totalCount);
                setLimit(response?.data?.data?.limit)
                setPage(response?.data?.data?.page)
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
            name: 'Name',
            selector: (row) => row?.name,
            width: "20%"
        },
        {
            name: 'Short Code',
            selector: (row) => row?.shortCode
        },
        {
            name: 'Logic',
            selector: (row) => '{code}',
        },
        {
            name: 'Created By',
            selector: (row) => row?.createdUser[0]?.name || "",
        },
        {
            name: 'Updated By',
            selector: (row) => row?.updatedUser[0]?.name || "",
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
                    <button className="ui blue icon button basic" onClick={()=>onClickEditButton(row._id)}>
                    <i className="edit icon"></i>
                </button>
                }
                {
                    <button className="ui red icon button basic" onClick={()=>onClickDeleteButton(row._id)}>
                        <i className="trash icon"></i>
                    </button>
                }
            </div>
            )
            ,
        },
    ];


    const dependecies = [search]
    useDebounce(() => { getAllLogics() }, 300, dependecies);

    useEffect(() => {
        getAllLogics(fromDate, toDate);
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
                    onHidden={() => navigate('/dashboard/custom-logic')}
                    vertical={'vertical'}
                    visible={visible}>
                    <AddLogic
                        visible={visible}
                        getAllLogics={getAllLogics}
                    />
                </Sidebar>
                <Sidebar.Pusher dimmed={visible} className="fadeIn">
                    <div className="page-header">
                        <div>
                            <Breadcrumb icon="right angle" sections={sections} />
                            <div className="header-text">All Logic list</div>
                            <div className="sub-text">List of all Logic List</div>
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
                            <Button
                                primary
                                style={{borderRadius:'20px'}}
                                onClick={() => {
                                    navigate('/dashboard/custom-logic/add');
                                }}>
                                Add Logic
                            </Button>
                        </div>
                    </div>
                    <TableWrapper
                        columns={columns}
                        data={logic}
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
                        getAllLogics();
                    }}>
                        Clear Filter
                    </Button>
                    <Button color='gray' onClick={() => {
                        setFilterModalOpen(false);
                        getAllLogics(fromDate, toDate);
                    }}>
                        Apply
                    </Button>
                </Modal.Actions>
            </Modal>
        </>

    );

}

export default CustomLogic;
