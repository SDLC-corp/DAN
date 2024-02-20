import React, { useEffect, useState } from 'react';
import { Breadcrumb, Form, Image } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { apiGET } from '../../utils/apiHelper';
import { Chart as ChartsJs, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2';
import DateRange from '../../components/daterangepicker/dateRangePicker';
import ShippingLineNameDropdown from '../../components/dropdown/shippingLineDropdown';

ChartsJs.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function Dashboard() {

  const sections = [{ key: 'Dashboard', content: 'Dashboard', link: true }];
  const [counts, setCounts] = useState({
    shippingLineCount: '',
    domainCount: '',
    documentCount: '',
    jobCount: '',
    shippingLineCounts: '',
    userCount: '',
    mblCount: '',
    hblCount: '',
    syncCount: '',
    asyncCount: ''
  })
  const [loading, setLoading] = useState(false)
  const [label, setlabel] = useState([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [lastThirtyDaysUploadedDocumentArr, setLastThirtyDaysUploadedDocumentArr] = useState([])
  const [documentUploadedByUsers, setDocumentUploadedByUsers] = useState([])
  const [documentUploadedByShippingLine, setDocumentUploadedByShippingLine] = useState([])
  const [range, setRange] = useState([]);
  const [errorObj, setErrorObj] = useState({})
  const [filterShippingLine, setFilterShippingLine] = useState('')

  const getDocumentsCount = async (range,filterShippingLine) => {
    setLoading(true);
    try {
      let response
      if (showDatePicker || filterShippingLine) {
        const filterShippingLineArray = JSON.stringify(filterShippingLine) 
        response = await apiGET(
          `/v1/dashboardAnalysis?fromDate=${range[0]?.startDate ? range[0]?.startDate : ""}&toDate=${range[0]?.endDate ? range[0]?.endDate : ""}&shippingLine=${filterShippingLineArray}`
        );
      }

      else {
        response = await apiGET(
          `/v1/dashboardAnalysis`
        );
      }
      if (response.status === 200) {
        setCounts({
          jobCount: response.data.data.data.jobCount,
          documentCount: response.data.data.data.documentsCount,
          userCount: response.data.data.data.userCount,
          shippingLineCount: response.data.data.data.shippingLineCount,
          mblCount: response.data.data.data.mblDocumentTypeCount,
          hblCount: response.data.data.data.hblDocumentTypeCount,
          syncCount: response.data.data.data.syncWithOtmDocumentCount,
          asyncCount: response.data.data.data.asyncWithOtmDocumentCount,
          shippingLineCounts: response.data.data.data.shippingLineCounts,
          domainCount: response.data.data.data.domainCount,
        })
        setLastThirtyDaysUploadedDocumentArr(response.data.data.data.lastThirtyDaysUploadedDocumentCount)
        setDocumentUploadedByUsers(response.data.data.data.documentUploadedByUser)
        setDocumentUploadedByShippingLine(response.data.data.data.documentUploadedByShippingLine)
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


  const dataCounts = label?.map((dateLabel) => {
    const matchingCount = lastThirtyDaysUploadedDocumentArr.find((item) => item.date === dateLabel.date);
    return matchingCount ? matchingCount.count : 0;
  });

  //Data of Uploaded Documents
  const data = {
    labels: label?.map(item => item.date),
    datasets: [
      {
        label: `Document Uploaded in last 30 Days`,
        data: dataCounts,
        borderColor: '#35C69D',
        backgroundColor: '#35C69D',
        cubicInterpolationMode: 'monotone',
        yAxisID: 'y',
        tension: 0.4,
      },
    ]
  };

  //Data of Uploaded Documents
  const documentUploadedByUserData = {
    labels: documentUploadedByUsers.map(item => item.createdBy),
    datasets: [
      {
        label: `Document Uploaded `,
        data: documentUploadedByUsers.map(item => item.count),
        borderColor: '#35C69D',
        backgroundColor: '#35C69D',
        cubicInterpolationMode: 'monotone',
        yAxisID: 'y',
        tension: 0.4,
        barThickness: 30, // Adjust the bar thickness as needed
      },
    ],
  };

  //Data of Uploaded Documents By Shipping Line
  const documentUploadedByShippingLines = {
    labels: documentUploadedByShippingLine.map(item => item.shippingLineName),
    datasets: [
      {
        label: `Document By Document Types`,
        data: documentUploadedByShippingLine.map(item => item.count),
        borderColor: '#35C69D',
        backgroundColor: '#35C69D',
        cubicInterpolationMode: 'monotone',
        yAxisID: 'y',
        tension: 0.4,
        barThickness: 30, // Adjust the bar thickness as needed
      },
    ],
  };


  // Data for hbl mbl Documents
  const mblHblData = {
    labels: [`${7} Document Types`, `${8} Document Types`],
    datasets: [
      {
        label: 'Document Types',
        // data: [counts.mblCount, counts.hblCount],
        data: [7, 2],
        backgroundColor: [
          'rgba(158, 202, 225, 1)',
          'rgba(50, 130, 189, 1)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for Sync and async Documents
  const syncAsyncData = {
    // labels: [`${counts.syncCount} Sync : Yes`, `${counts.asyncCount}  Sync : No`],
    labels: [`${10} Sync : Yes`, `${5}  Sync : No`],
    datasets: [
      {
        // data: [counts.syncCount, counts.asyncCount],
        data: [10,5],
        backgroundColor: [
          'rgba(158, 202, 225, 1)',
          'rgba(50, 130, 189, 1)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  //Options of Uploaded Documents
  const options = {
    responsive: true,
    maintainAsepectRatio: true,
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      margin: 10
    },

    scales: {
      x: {
        grid: {
          display: true, // Hide the gridlines for the x-axis
          width: '10%',

        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left', // The y-axis for "Total Orders" dataset
        suggestedMin: 0, // Optional: minimum value for the y-axis
        grid: {
          display: false, // Hide the gridlines for the x-axis
        }
      },
    },
  };

  const getBlNo = (fieldsAndValues) => {
    if (fieldsAndValues) {
      let found = fieldsAndValues.filter(item => item.fieldName == 'bl_no')
      if (found[0]) return found[0].fieldValue
    }
    return ''
  }

  const transformData = (data) => {
    const map = {};
    const roots = [];

    // Create a map of _id to the item and initialize children as an empty array
    data.forEach((item) => {
      item.children = [];
      map[item._id] = item;
    });

    // Iterate through the data to build the tree structure
    data.forEach((item) => {
      const parentItem = map[item.parentId];
      if (parentItem) {
        parentItem.children.push(item);
      } else {
        roots.push(item); // If no parent found, treat it as a root element
      }
    });
    // convert it into nodepath
    let array = getNodePaths(roots[0], roots[0].label)
    return array;
    return roots;
  };

  function getNodePaths(node, parentPath = "") {
    if (node.children && node.children.length > 0) {
      return node.children.reduce((paths, child) => {
        const childPath = getNodePaths(child, parentPath + "/" + child.label);
        return paths.concat(childPath);
      }, []);
    } else {
      return [parentPath];
    }
  }


  useEffect(() => {
    getDocumentsCount(range,filterShippingLine)
  }, [range,filterShippingLine])

  return (
    <div className="fadeIn  page-content-wrapper">
      <div className="page-header">
        <div>
          <Breadcrumb icon="right angle" sections={sections} />
          <div className="header-text">Dashboard</div>
          <div className="sub-text">Overview for statistics</div>
        </div>
        <div className="page-header-actions" style={{display:"flex"}}>
        {/* <div>
        <label style={{alignItems:'center',fontWeight: 500,fontSize: '14px',marginBottom:10}}>Select Location</label>
          <Form.Dropdown
            placeholder="Select Location"
            options={domainOptions || []}
            required={true}
            //   error={errorObj && errorObj.fieldId}
            selection
            clearable
            multiple
            onFocus={() => {
              setErrorObj();
            }}
            value={domainName}
            disabled={loading}
            onChange={(e, data) => {
              setDomainName(data.value);
            }}
          />
        </div> */}
        <div style={{marginLeft:10}}>
            <label style={{alignItems:'center',fontWeight: 500,fontSize: '14px',marginBottom:10}}>Select Document Types</label>
            <div>
                <ShippingLineNameDropdown multiselect={true} shippingId={filterShippingLine}shippingLineId={setFilterShippingLine} height="10px"/>
            </div>
        </div>

        </div>
      </div>
      <div style={{ padding: 15, background: '#f1f5f9' }}>
        {/* Recently Uploaded Documents Graph */}
        <div className="ui container fluid">
          <div className="ui stackable grid" style={{display:"flex",justifyContent:"space-between"}}>

            {/*Documents Count */}
            <CardComponent
              headerText="Total Documents"
              icon="list icon"
              count={counts.documentCount}
            />

            {/*Shipping Line Count*/}
            <CardComponent
              headerText="Total Document Types"
              icon="bars icon"
              count={counts.shippingLineCount}
            />

            {/*Job Count*/}
            {/* <CardComponent
              headerText="Total Job"
              icon="list icon"
              count={counts.jobCount}
            /> */}

            {/*User Count*/}
            <CardComponent
              headerText="Total User"
              icon="user icon"
              count={counts.userCount}
            />

          </div>
        </div>

        {/* Recent Jobs List & Recently Uploaded Documents*/}
        <div className="ui grid" style={{ width: '100%', alignItems: 'center' }}>
          <div className="left floated five wide column">
            <div style={{ alignItems: 'center', fontWeight: 600, marginBottom: '0px', fontSize: '16px' }}>
              Recently Uploaded Documents
            </div>
          </div>
          <div className="right floated five wide column" style={{ width: '100%' }}>
            <DateRange setRangeProps={setRange} showDatePicker={setShowDatePicker} setlabel={setlabel} />
          </div>
        </div>
        <div className="ui container fluid" >
          <div className="ui grid">
            <div className="row">
              <div className="sixteen wide tablet eight wide computer column">
                <div className="ui segment">
                  <Bar
                    height={200}
                    data={data}
                    options={options}
                  />
                </div>
              </div>
              <div className="sixteen wide tablet eight wide computer column">
                <div className="ui segment">
                <div class="ui grid" style={{height:"320px", display:"flex",justifyContent:"center",alignItems:"center"}}>
                  <div class="eight wide column">
                    <Pie data={mblHblData} style={{ width: 300, height: 300 }} />
                  </div>
                  <div class="eight wide column">
                    <Pie data={mblHblData} style={{ width: 300, height: 300 }} />
                  </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-header-text">Documents Uploaded By Users</div>
        <div className="ui segment">
          <Bar
            height={100}
            data={documentUploadedByUserData}
            options={options}
          />
        </div>

        <div className="container-header-text">Documents By Document Types</div>
        <div className="ui segment">
          <Bar
            height={100}
            data={documentUploadedByShippingLines}
            options={options}
          />
        </div>
        <div style={{ height: 70 }}></div>
      </div>
    </div>
  );
}



const CardComponent = ({ headerText, icon, seriesCount, count }) => (
  <div className="ten wide tablet five wide computer column" >
    <div className="ui segment" >
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <div>
          <div className="container-collection-text">{headerText}</div>
          <div style={{ height: 15 }}></div>
          <div className='container-count-text'>{count || 0}</div>
        </div>
        <div>
          <i className={icon}></i>
        </div>
      </div>
    </div>
  </div>
);


export default Dashboard;
