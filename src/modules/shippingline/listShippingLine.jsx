import React, { useContext, useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Image, Input, Modal, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import AddShippingLine from './addShippingLine';
import {apiGET, apiPUT, objectToQueryParam } from '../../utils/apiHelper';
import moment from 'moment'
import Swal from 'sweetalert2'
import useDebounce from '../../utils/useDebounce';
import DateRangeFilter from '../../components/filter/daterangeFilter';
import { ADD_SHIPPING_LINE, DELETE_SHIPPING_LINE, EDIT_SHIPPING_LINE, hasAccess } from '../../utils/accessHelper';
import { AuthContext } from '../../contexts';

function ShippingLineList() {

  const navigate = useNavigate();
  let { action } = useParams();
  const [params, setParams] = useSearchParams()
  const queryLimit = params.get('limit');
  const queryPage = params.get('page');
  const querySearchFilter = params.get('search');
  const [visible, setVisible] = React.useState(action == 'add');
  const [shippingLine, setShippingLine] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(+queryPage || 1);
  const [limit, setLimit] = useState(+queryLimit || 10);
  const [search, setSearch] = useState(querySearchFilter || '')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const validInputRegex = /^[a-zA-Z0-9\s]*$/
  const { user }= useContext(AuthContext)


  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'Carrier Line List', content: 'Carrier Line List', active: true },
  ];


  const getAllShippingLine = async (fromDate,toDate,search) => {
    try {
      setLoading(true);
      let response;
      if (search || (fromDate && toDate)) {
        const payload = {
          search: {
            name: search,
            fromDate:fromDate,
            toDate:toDate
          }
        }
        const queryParams = objectToQueryParam(payload)
        response = await apiGET(`/v1/shipping-lines?${queryParams}&limit=${limit}&page=${page}`)
      }
      else {
        response = await apiGET(`/v1/shipping-lines?page=${page}&limit=${limit}`,);
      }
      setLoading(false);
      if (response.status === 200) {
        setShippingLine(response?.data?.data?.data);
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
    navigate(`/dashboard/carrier-line/edit/${id}`);

  }

  const onClickDeleteButton = async (id) => {
    Swal.fire({
      title: `Are you sure ? `,
      icon: 'warning',
      text: 'Want to delete this shipping line?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      buttons: true,
    }).then(async (result) => {
      try {
        if (result.isConfirmed) {
          const response = await apiPUT(`/v1/shipping-lines/${id}`)
          if (response.status === 200) {
            Swal.fire({
              title: "Success!",
              text: " Carrier Line Deleted successfully",
              icon: "success",
            });
            getAllShippingLine(fromDate,toDate,search)
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
      name: 'Logo',
      selector: (row) =>
        <div >
          {row.logo 
            ? <Image src={row.logo} size='mini' style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
            : <i className="plane icon" style={{ width: "30px", height: "15px", borderRadius: "50%" }}></i>}  
        </div>,
      width: '10%'
    },
    {
      name: 'Name',
      selector: (row) => row.name
    },
    {
      name: 'Model Id',
      selector: (row) => row.modelId,
    },
    {
      name: 'Type',
      selector: (row) => <p style={{textTransform:"capitalize"}}>{row?.type}</p>,
    },
    {
      name: 'Created On',
      selector: (row) => row && <><p>{moment(row?.createdAt).format('DD/MM/YYYY')}</p>{moment(row?.createdAt).format('HH:mm a')}</>,
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
                hasAccess(EDIT_SHIPPING_LINE) && <button className="ui blue icon button basic" onClick={() => onClickEditButton(row._id)}>
                <i className="edit icon"></i>
            </button>
            }
            {
                hasAccess(DELETE_SHIPPING_LINE) && <button className="ui red icon button basic" onClick={() => onClickDeleteButton(row._id)}>
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
    getAllShippingLine(fromDate,toDate,search);
    setParams({page:page,limit:limit,search:search})
  }, [page, limit,search]);

  const dependencies = [search];
  useDebounce(() => {
    getAllShippingLine(fromDate,toDate,search);
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
          onHide={() => setVisible(false)}
          onHidden={() => navigate('/dashboard/carrier-line')}
          vertical={'vertical'}
          visible={visible}>
          <AddShippingLine
            visible={visible}
            getAllShippingLine={getAllShippingLine}
          />
        </Sidebar>
        <Sidebar.Pusher dimmed={visible} className="fadeIn">
          <div className="page-header">
            <div>
              <Breadcrumb icon="right angle" sections={sections} />
              <div className="header-text">All Carrier line</div>
              <div className="sub-text">List of all Carrier line</div>
            </div>
            <div className="page-header-actions">
                <Input
                  style={{ marginRight: '10px', height: 37 }}
                  icon='search'
                  placeholder="Search Carrier Line Name "
                  type="text"
                  onChange={(e, { value }) => {
                        let inputValue = value
                        if (inputValue === '' || validInputRegex.test(inputValue)) {
                            setSearch(inputValue)
                        }else{
                            console.log("Validation: No special characters allowed");
                        }
                    }}
                  value={search}
                />
                <div style={{ marginRight: 5 }}>
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
                hasAccess(ADD_SHIPPING_LINE) && <Button
                primary
                onClick={() => {
                  navigate('/dashboard/carrier-line/add');
                }}>
                Add Carrier line
              </Button>
            } 
            </div>
          </div>
          <TableWrapper
            columns={columns}
            data={shippingLine}
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
            getAllShippingLine();
          }}>
            Clear Filter
          </Button>
          <Button color='gray' onClick={() => {
            setFilterModalOpen(false);
            getAllShippingLine(fromDate, toDate);
          }}>
            Apply
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default ShippingLineList;
