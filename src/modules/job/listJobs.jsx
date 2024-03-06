import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Modal, Popup, Sidebar, Table } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, objectToQueryParam } from '../../utils/apiHelper';
import moment from 'moment'
import Swal from 'sweetalert2'
import DateRangeFilter from '../../components/filter/daterangeFilter';
import useDebounce from '../../utils/useDebounce';
import StatusView from './viewStatus';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';


/* TODO: Used in backend also || *Key: Use their side and *value: use for our side as in jobs table '.' not allowed in mongo */
const QUALIFIERS = {
    "SHIPPER": "SHIPPER",
    "CONSIGNEE": "CONSIGNEE",
    "NOTIFY_PARTY_1": "TW.NOTIFY_PARTY_1",
    "NOTIFY_PARTY_2": "TW.NOTIFY_PARTY_2"
}

function JobList() {

    const navigate = useNavigate();
    let { action } = useParams();
    const [params, setParams] = useSearchParams()
    const [visible, setVisible] = React.useState(action == 'add');
    const [jobsList, setJobslist] = useState([]);
    const queryLimit = params.get('limit');
    const queryPage = params.get('page');
    const querySearchFilter = params.get('search');
    const [singleJobsList, setSingleJobsList] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(+queryPage || 1);
    const [limit, setLimit] = useState(+queryLimit || 10);
    const [search, setSearch] = useState(querySearchFilter || '')
    const [modalOpen, setModalOpen] = useState(false)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [blNo, setBlNo] = useState('')
    const [docNo, setDocNo] = useState('')
    let authContext = useContext(AuthContext);

    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Jobs List', content: 'Jobs List', active: true },
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

    const getAllJobs = async (fromDate, toDate) => {
        try {
            setLoading(true);
            let response;
            if (fromDate || toDate || search) {
                 response = await apiGET(`/v1/job?search=${search}&fromDate=${fromDate}&toDate=${toDate}&limit=${limit}&page=${page}`);
            }
            else {
                    response = await apiGET(`/v1/job/?page=${page}&limit=${limit}`);
            }
            setLoading(false);
            if (response.status === 200) {
                setJobslist(response?.data?.data?.data);
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

    const onClickOpenModal = async (id,blno,docno) => {
        console.log("BL doc",blNo,docno);
        setBlNo(blno)
        setDocNo(docno)
        setModalOpen(true)
        const response = await apiGET(`v1/job/${id}`)
        if (response.status === 200) {
            setSingleJobsList(response.data.data)
        }
    }

    const getBlNo = (fieldsAndValues) => {
        if (fieldsAndValues) {
            let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
            if (found[0]) {
                return found[0].fieldValue}
        }
        return ''
    }
    const columns = [
        {
            name: 'Job Id',
            selector: (row) => row.seqId,
            width: "7%"
        },
        {
            name: 'BL Number',
            selector: (row) => row && getBlNo(row.documentsdata?.fieldsAndValues),
        },
        {
            name: <p>Document Number</p>,
            selector: (row) => row?.documentsdata?.documentNo,
            width: "15%"
        },
        {
            name: 'Location',
            selector: (row) => row?.documentsdata?.domainName,
        },
        {
            name: 'Created By',
            selector: (row) => row?.userdata?.name,
        },
        {
            name: 'Created On',
            selector: (row) => <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('HH:mm a')}</>
            // selector: (row) => console.log();
        },
        {
            name: 'Updated On',
            selector: (row) => <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('HH:mm a')}</>
        },
        {
            name: 'Action',
            cell: (row) => (
                <div>
                    <Popup content='View Document' trigger={<Button icon='eye' size='small' onClick={() => {
                    navigate("/dashboard/document-list/view/" + row.documentId)}} />} />
                    <Button onClick={() => {
                        onClickOpenModal(row?._id, 
                            getBlNo(row.documentsdata?.fieldsAndValues),row?.documentsdata?.documentNo)
                    }} size='mini me-0'
                    >View Status</Button>
                </div>
            ),
            width:'20%'
        },
    ];


    useEffect(() => {

        if (action == 'add' || action == 'edit') {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [action]);

    useEffect(() => {
        getAllJobs(fromDate, toDate)
        if (search.trim()) {
        setParams({page:page,limit:limit,search:search})
        }else{
        setParams({page:page,limit:limit})
        }
    }, [page, limit,search])

    useDebounce(() => {
        getAllJobs();
    }, 300, [search])

    return (
        <>
            <Sidebar.Pushable>
                <Sidebar.Pusher dimmed={modalOpen} className="fadeIn">
                    <div className="page-header">
                        <div>
                            <Breadcrumb icon="right angle" sections={sections} />
                            <div className="header-text">All jobs</div>
                            <div className="sub-text">List of all jobs</div>
                        </div>
                        <div className="page-header-actions">
                            <Input icon='search' placeholder='BL Number | Documnet No.'
                                value={search || ''}
                                style={{ height: 37, marginRight: 17 }}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                }}
                            />
                            <Dropdown
                                text='Select Date'
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
                    </div>
                    <TableWrapper
                        columns={columns}
                        data={jobsList}
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
                    <Sidebar
                        style={{
                            width: 900,
                        }}
                        as={'div'}
                        animation="overlay"
                        icon="labeled"
                        direction="right"
                        onHide={() => {
                            setModalOpen(false)
                        }}
                        onHidden={() => navigate('/dashboard/jobs')}
                        vertical={'vertical'}
                        visible={modalOpen}
                    >
                        <StatusView 
                            startTime={singleJobsList?.startTime}
                            endTime={singleJobsList?.endTime}
                            status={singleJobsList?.status}
                            blNo={blNo} docNo={docNo}
                            singleJobsList={singleJobsList} 
                            modalOpen={setModalOpen} 
                        />
                    </Sidebar>

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
                        getAllJobs();
                    }}>
                        Clear Filter
                    </Button>
                    <Button color='gray' onClick={() => {
                        setFilterModalOpen(false);
                        getAllJobs(fromDate, toDate);
                    }}>
                        Apply
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    );
}

export default JobList;