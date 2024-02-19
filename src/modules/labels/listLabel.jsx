import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Dropdown, Input, Sidebar } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import TableWrapper from '../../utils/tableWrapper';
import { apiDELETE, apiGET } from '../../utils/apiHelper';
import Swal from 'sweetalert2'
import ShippingLineActionButtons from '../../components/button/actionButtons';
import moment from 'moment';
import AddLabel from './addLabel';
import useDebounce from '../../utils/useDebounce';

function LabelList() {

  const navigate = useNavigate();
  let { action } = useParams();
  const [visible, setVisible] = React.useState(action == 'add');
  const [label, setLabel] = useState([]);
  const [shippingLineNameList, setShippingLineNameList] = useState([])
  const [shippingLineId, setShippingLineId] = useState('')
  const [search, setSearch] = useState('')
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'label List', content: 'label List', active: true },
  ];


  const getAllLabel = async () => {
    try {
      setLoading(true);
      let response;
      if (search || shippingLineId) {
        response = await apiGET(`/v1/labels/?search[name]=${search}&search[shippingLineId]=${shippingLineId}&limit=${limit}&page=${page}`)
      }
      else {
        response = await apiGET(`/v1/labels?limit=${limit}&page=${page}`);
      }
      setLoading(false);
      if (response.status === 200) {
        setLabel(response?.data?.data?.data);
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

  const getAllLabelWithOutLimit = async () => {
    try {
      setLoading(true);
      let response = await apiGET(`/v1/labels/?limit=200`)
      setLoading(false);
      if (response.status === 200) {
        let list = response?.data?.data?.data;
        if (list && list.length) {
          const uniqueTexts = new Set();
          list = list.filter((item) => {
            const text = item?.shippingLine?.name;
            if (!uniqueTexts.has(text)) {
              uniqueTexts.add(text);
              return true;
            }
            return false;
          });
          list = list.map((item) => {
            return {
              key: item?.shippingLine?.name,
              text: item?.shippingLine?.name,
              value: item?.shippingLineId,
            };
          });
        }
        setShippingLineNameList(list)
        if (shippingLineId) {
          setLabel(response?.data?.data?.data);
          setTotalRows(response?.data?.data?.totalCount);
          setLimit(response?.data?.data?.limit)
          setPage(response?.data?.data?.page)
        }
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

  //To get ShippingLine Id
  const onChangeShippingLineId = (e, data) => {
    setShippingLineId(data.value)
  };


  const onClickEditButton = (id) => {
    navigate(`/dashboard/labels/edit/${id}`);
  }

  const onClickDeleteButton = async (id) => {
    try {
      const response = await apiDELETE(`/v1/labels/${id}`)
      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Shipping item Deleted successfully",
          icon: "success",
        });
        getAllLabel()
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
  }

  const columns = [
    {
      name: 'Label',
      selector: (row) =>
        row?.label
    },
    {
      name: 'Shipping Line Name',
      selector: (row) =>
        row?.shippingLine?.name
    },
    {
      name: 'Field Name',
      selector: (row) =>
        row?.field?.paramName
    },
    {
      name: 'Created On',
      selector: (row) => moment(row?.createdAt).format('MMMM Do YYYY'),
    },
    {
      name: 'Action',
      selector: (row) => (
        <ShippingLineActionButtons
          onClickEditButton={() => onClickEditButton(row._id)}
        // onClickDeleteButton={() => onClickDeleteButton(row._id)}
        />
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
    getAllLabel();
  }, [page, limit, shippingLineId]);

  useEffect(() => {
    getAllLabelWithOutLimit()
  }, [])

  const dependecies = [search]
  useDebounce(() => { getAllLabel() }, 300, dependecies);


  return (
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
        onHidden={() => navigate('/dashboard/labels')}
        vertical={'vertical'}
        visible={visible}>
        <AddLabel
          visible={visible}
          getAllLabel={getAllLabel}
        />
      </Sidebar>
      <Sidebar.Pusher dimmed={visible} className="fadeIn">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">All label list</div>
            <div className="sub-text">List of all label List</div>
          </div>
          <div className="page-header-actions">
            <Input icon='search' placeholder='Search Label'
              value={search || ''}
              style={{ marginRight: '10px', height: 37 }}
              onChange={(e) => {
                setSearch(e.target.value)
              }} />
            <Dropdown
              className='index'
              clearable
              placeholder='Select Shipping line'
              style={{ marginRight: '10px', height: 30 }}
              search
              selection
              options={shippingLineNameList}
              onChange={onChangeShippingLineId}
            />
            <Button
              primary
              onClick={() => {
                navigate('/dashboard/labels/add');
              }}>
              Add label
            </Button>
          </div>
        </div>
        <TableWrapper
          columns={columns}
          data={label}
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
  );
}

export default LabelList;
