import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Image, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import AddFields from './addFields';
import moment from 'moment';
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';

function FieldList() {

  const navigate = useNavigate();
  let { action } = useParams();
  const [visible, setVisible] = React.useState(action == 'add');
  const [Field, setField] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const validInputRegex = /^[a-zA-Z0-9\s]*$/;


  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'Field List', content: 'Field List', active: true },
  ];


  const getAllField = async (fromDate,toDate) => {
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
        response = await apiGET(`/v1/fields?${queryParams}&limit=${limit}&page=${page}`)
      }
      else {
        response = await apiGET(`v1/fields?limit=${limit}&page=${page}`,);
      }
      setLoading(false);
      if (response.status === 200) {
        setField(response?.data?.data?.data);
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

  const onClickEditButton = (id) => {
    navigate(`/dashboard/fields/edit/${id}`);
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
      text: 'Want to delete this Fields?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      buttons: true,
    }).then(async (result) => {
      try {
        if (result.isConfirmed) {
          const response = await apiPUT(`/v1/fields/${id}`)
          if (response.status === 200) {
            Swal.fire({
              title: "Success!",
              text: "Fields Deleted successfully",
              icon: "success",
            });
            getAllField()
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
      name: 'Param Name',
      selector: (row) => row?.paramName,
      width: "15%"
    },
    {
      name: 'Display Name',
      selector: (row) => row && <p>{row?.displayName}</p>,
      width: "20%"
    },
    {
      name: 'Created By',
      selector: (row) => row?.createdUser[0]?.name || "--",
    },
    {
      name: 'Updated By',
      selector: (row) => row?.updatedUser[0]?.name || "",
    },
    {
      name: 'Created On',
      selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('H:MM a')}</>,
    },
    {
      name: 'Updated On',
      selector: (row) => row && <><p>{moment(row?.updatedAt).format('DD/MM/YYYY')}</p>{moment(row?.updatedAt).format('H:MM a')}</>,
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


  useEffect(() => {

    if (action == 'add' || action == 'edit') {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [action]);
  useEffect(() => {
    getAllField(fromDate,toDate);
  }, [page, limit]);

    useEffect(() => {
      document.title="Admin Panel | Fields"
    }, [])


  const dependecies = [search]
  useDebounce(() => { getAllField() }, 300, dependecies);

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
          onHide={() => setVisible(false)}
          onHidden={() => navigate('/dashboard/fields')}
          vertical={'vertical'}
          visible={visible}>
          <AddFields
            visible={visible}
            getAllField={getAllField}
          />
        </Sidebar>
        {/* <Sidebar
          style={{
            width: 700,
          }}
          as={'div'}
          animation="overlay"
          icon="labeled"
          direction="right"
          onHide={() => setFieldGroupVisible(false)}
          onHidden={() => navigate('/dashboard/fields')}
          vertical={'vertical'}
          visible={fieldGroupVisible}>
          <AddFieldGroup
            visible={fieldGroupVisible}
            getAllField={getAllField}
          />
        </Sidebar> */}
        <Sidebar.Pusher dimmed={visible} className="fadeIn">
          <div className="page-header">
            <div>
              <Breadcrumb icon="right angle" sections={sections} />
              <div className="header-text">All field list</div>
              <div className="sub-text">List of all Field List</div>
            </div>
            <div className="page-header-actions">
               <Button
                style={{ marginRight: 10, borderRadius:'20px' }}
                onClick={() => {
                  navigate('/dashboard/field-group');
                }}>
                Field Group
              </Button>  
              <Input icon='search' placeholder='Search Params Name | Display Name'
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
                  style={{ borderRadius:'20px'}}
                  className='icon'
                  onClick={() => {
                    setFilterModalOpen(true)
                  }}
                ></Dropdown>
              </div>
              <Button
                primary
                style={{ borderRadius:'20px'}}
                onClick={() => {
                  navigate('/dashboard/fields/add');
                }}>
                Add Field
              </Button>
            </div>
          </div>
          <TableWrapper
            columns={columns}
            data={Field}
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
            getAllField();
          }}>
            Clear Filter
          </Button>
          <Button color='gray' onClick={() => {
            setFilterModalOpen(false);
            getAllField(fromDate, toDate);
          }}>
            Apply
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default FieldList;
