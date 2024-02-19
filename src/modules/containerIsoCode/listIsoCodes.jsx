import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiDELETE, apiGET, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import moment from 'moment';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import AddIsoCodes from './addIsoCodes';
import { AuthContext } from '../../contexts';
import { ADD_CONTAINER_ISO_CODE, DELETE_CONTAINER_ISO_CODE, EDIT_CONTAINER_ISO_CODE, hasAccess } from '../../utils/accessHelper';

function ListIsoCodes() {
    const navigate = useNavigate()
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = React.useState(action == 'add');
    const [isoCodeList, setIsoCodeList] = useState([]);
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
    const validInputRegex = /^[a-zA-Z0-9\s/_.'"]*$/
    const { user } = useContext(AuthContext)

    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Port Master List', content: 'Port Master List', active: true },
    ];


    const onClickEditButton = (id) => {
        navigate(`/dashboard/containerisocodes/edit/${id}`);
    }

      const getIsoCodesList = async (fromDate, toDate,search) => {
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
                response = await apiGET(`v1/isoCodes/list?${queryParams}&limit=${limit}&page=${page}`)
            }
            else {
                response = await apiGET(`v1/isoCodes/list?page=${page}&limit=${limit}`);
            }
            setLoading(false);
            if (response.status === 200) {
                setIsoCodeList(response?.data?.data?.data);
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


    const onClickDeleteButton = async (id) => {
        Swal.fire({
            title: `Are you sure? `,
            icon: 'warning',
            text: 'Want to delete this Container ISO Code?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            buttons: true,
        }).then(async (result) => {
            try {
                if (result.isConfirmed) {
                    const response = await apiDELETE(`v1/isoCodes/${id}`)
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Success!",
                            text: "Container ISO Code Deleted successfully",
                            icon: "success",
                        });
                        getIsoCodesList(fromDate,toDate,search)
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

  


    const columns = [
        {
            name: '#',
            selector: (row) => row?.seqId,
            width: "7%"
        },
        {
            name: 'Text',
            selector: (row) => row?.text,
        },
        {
            name: 'Code',
            selector: (row) => row?.code
        },
        {
            name: 'Description',
            selector: (row) => row?.description,
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
                hasAccess(EDIT_CONTAINER_ISO_CODE) && <button className="ui blue icon button basic" onClick={() => {onClickEditButton(row._id)}}>
                <i className="edit icon"></i>
            </button>
            }
            {
                hasAccess(DELETE_CONTAINER_ISO_CODE) && <button className="ui red icon button basic" onClick={() => {onClickDeleteButton(row._id)}}>
                    <i className="trash icon"></i>
                </button>
            }
        </div>
            )
            ,
        },
    ];


    const dependecies = [search]
    useDebounce(() => { getIsoCodesList(fromDate, toDate,search) }, 300, dependecies);

    useEffect(() => {
        getIsoCodesList(fromDate, toDate,search);
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
                    onHidden={() => navigate('/dashboard/containerisocodes')}
                    vertical={'vertical'}
                    visible={visible}>
                    <AddIsoCodes
                        visible={visible}
                        getIsoCodesList={getIsoCodesList}
                    />
                </Sidebar>
                <Sidebar.Pusher dimmed={visible} className="fadeIn">
                    <div className="page-header">
                        <div>
                            <Breadcrumb icon="right angle" sections={sections} />
                            <div className="header-text">All ISO Codes list</div>
                            <div className="sub-text">List of all ISO Codes List</div>
                        </div>
                        <div className="page-header-actions">

                            <Input icon='search' placeholder='Test | Code | Description'
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
                            hasAccess(ADD_CONTAINER_ISO_CODE) &&<Button
                                primary
                                onClick={() => {
                                    navigate('/dashboard/containerisocodes/add');
                                }}>
                                Add ISO Codes
                            </Button>
                        }
                        </div>
                    </div>
                    <TableWrapper
                        columns={columns}
                        data={isoCodeList}
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
                        getIsoCodesList();
                    }}>
                        Clear Filter
                    </Button>
                    <Button color='gray' onClick={() => {
                        setFilterModalOpen(false);
                        getIsoCodesList(fromDate, toDate,search);
                    }}>
                        Apply
                    </Button>
                </Modal.Actions>
            </Modal>
        </>

    );

}

export default ListIsoCodes;
