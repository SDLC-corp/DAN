import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import useDebounce from '../../utils/useDebounce';
import { Breadcrumb, Button, Dropdown, Input, Modal, Sidebar } from 'semantic-ui-react';
import TableWrapper from '../../utils/tableWrapper';
import AddFieldGroup from './addFieldGroup';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import moment from 'moment';
import Swal from 'sweetalert2';

const ListFieldGroup = () => {
    const navigate = useNavigate();
    const { action } = useParams();
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const validInputRegex = /^[a-zA-Z0-9\s]*$/;
    const [fieldGroupVisible, setFieldGroupVisible] = useState(action == 'add')
    const [fieldGroupList, setFieldGroupList] = useState([])


    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Field Group List', content: 'Field Group List', active: true },
    ];



    const onClickEditButton = (id) => {
        navigate(`/dashboard/field-group/edit/${id}`);
    }

    const handleInputChange = (e) => {
        const inputValue = e.target.value;

        if (inputValue === '' || validInputRegex.test(inputValue)) {
            setSearch(inputValue);
        } else {
            console.log("Validation: No special characters allowed");
        }
    };


    const onClickDeleteButton = async (id) => {
        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'Want to delete this Field Group?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const response = await apiPUT(`/v1/field-group/${id}`)
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Success!",
                            text: "Field Group Deleted successfully",
                            icon: "success",
                        });
                        getAllFieldGroup()
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
            name: 'Index',
            selector: (row) => row && <p>{row?.index}</p>,
            width: "10%"
        },
        {
            name: 'Name',
            selector: (row) => row?.name,
        },
        {
            name: 'Description',
            selector: (row) => row && <p>{row?.description || "--"}</p>,
        },
        {
            name: 'Layout',
            selector: (row) => row && <p>{row?.layout}</p>,
        },
        {
            name: 'Updated By',
            selector: (row) => row?.updatedUser?.name || "",
        },
        {
            name: 'Created On',
            selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('H:mm a')}</>,
        },
        {
            name: 'Updated On',
            selector: (row) => row && <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('H:mm a')}</>,
        },
        {
            name: 'Action',
            selector: (row) => (
             <div className='flex gap-2'>
            { 
                <button className="ui blue icon button basic" onClick={() => onClickEditButton(row._id)}>
                    <i className="edit icon"></i>
                </button>
            }
            {
                <button className="ui red icon button basic" onClick={() => onClickDeleteButton(row._id)}>
                    <i className="trash icon"></i>
                </button>
            }
        </div>
            )
            ,
        },
    ];

    const getAllFieldGroup = async (fromDate, toDate) => {
        try {
            if (loading) return;
            setLoading(true)
            let response
            if (search || (fromDate && toDate)) {
                const payload = {
                    search: {
                        name: search,
                        fromDate: fromDate,
                        toDate: toDate
                    }
                }
                const queryParams = objectToQueryParam(payload)
                response = await apiGET(`/v1/field-group/list?${queryParams}&limit=${limit}&page=${page}`)
            }else{
            response = await apiGET(`/v1/field-group/list?limit=${limit}&page=${page}`)
            }
            setLoading(false)
            if (response.status === 200) {
                console.log("response", response);
                let result = response?.data?.data;
                setFieldGroupList(result?.data)
                setTotalRows(result?.totalCount);
                setLimit(result?.limit)
                setPage(result?.page)
            } else {
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

    console.log('fieldGroupList --->', fieldGroupList);
    useEffect(() => {
        if (action == "add" || action == "edit") {
            setFieldGroupVisible(true)
        } else {
            setFieldGroupVisible(false)
        }
    }, [action]);

    useEffect(() => {
        document.title = "Admin Panel | Field-Group"
    }, [])

    useEffect(() => {
        getAllFieldGroup()
    }, [page,limit])



    const dependecies = [search]
    useDebounce(() => { getAllFieldGroup() }, 300, dependecies);

    return <>
        <Sidebar.Pushable>
            <Sidebar
                style={{
                    width: 700,
                }}
                as={'div'}
                animation="overlay"
                icon="labeled"
                direction="right"
                onHide={() => setFieldGroupVisible(false)}
                onHidden={() => navigate('/dashboard/field-group')}
                vertical={'vertical'}
                visible={fieldGroupVisible}>
                <AddFieldGroup
                    visible={fieldGroupVisible}
                    getAllField={getAllFieldGroup}
                />
            </Sidebar>
            <Sidebar.Pusher dimmed={fieldGroupVisible} className="fadeIn">
                <div className="page-header">
                    <div>
                        <Breadcrumb icon="right angle" sections={sections} />
                        <div className="header-text">All field Group list</div>
                        <div className="sub-text">List of all Field Group List</div>
                    </div>
                    <div className="page-header-actions">
                        <Input icon='search' placeholder='Search Group | Layout | Desc '
                            value={search || ''}
                            style={{ marginRight: '10px', height: 37 }}
                            onChange={handleInputChange} />
                        <div style={{ marginRight: 5 }}>
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
                                navigate('/dashboard/field-group/add');
                            }}>
                            Add Group
                        </Button>
                    </div>
                </div>
                <TableWrapper
                    columns={columns}
                    data={fieldGroupList}
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
                    getAllFieldGroup();
                }}>
                    Clear Filter
                </Button>
                <Button color='gray' onClick={() => {
                    setFilterModalOpen(false);
                    getAllFieldGroup(fromDate, toDate);
                }}>
                    Apply
                </Button>
            </Modal.Actions>
        </Modal>
    </>
}

export default ListFieldGroup