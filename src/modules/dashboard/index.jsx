import React, { useEffect, useState } from 'react';
import { Breadcrumb, Form, Icon } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment'
import { apiGET } from '../../utils/apiHelper';
import { Chart as ChartsJs, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2';
import DateRange from '../../components/daterangepicker/dateRangePicker';
import { useContext } from 'react';
import { AuthContext } from '../../contexts';
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
    mawblCount:'',
    hawblCount:'',
    syncCount: '',
    asyncCount: ''
  })
  const [domainName, setDomainName] = useState('')
  const [jobList, setJobList] = useState([])
  const [domainOptions, setDomainOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [label, setlabel] = useState([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [lastThirtyDaysUploadedDocumentArr, setLastThirtyDaysUploadedDocumentArr] = useState([])
  const [documentUploadedByUsers, setDocumentUploadedByUsers] = useState([])
  const [documentUploadedByShippingLine, setDocumentUploadedByShippingLine] = useState([])
  const [documentUploadedByDomain, setDocumentUploadedByDomain] = useState([])
  const [range, setRange] = useState([]);
  const [errorObj, setErrorObj] = useState({})
  const { user } = useContext(AuthContext);
  let loggedInUser = JSON.parse(localStorage.getItem("user"))
  const [filterShippingLine, setFilterShippingLine] = useState('')
  const [carrierTypeFilterValue, setCarrierTypeFilterValue] = useState("all")
  const [usersByCarrierTypeFilterValue, setUsersByCarrierTypeFilterValue] = useState("all")
  const [domainsByCarrierTypeFilterValue, setDomainsByCarrierTypeFilterValue] = useState("all")
  const [carrierTypeFilterLoading, setCarrierTypeFilterLoading] = useState(false)
  const [usersByCarrierTypeFilterLoading, setUsersByCarrierTypeFilterLoading] = useState(false)
  const [domainsByCarrierTypeFilterLoading, setDomainsByCarrierTypeFilterLoading] = useState(false)
  const [globalCarrierListTypeValue, setGlobalCarrierListTypeValue] = useState("all")

const carrierTypeOption = [
  {
    key:"all",
    text:"All",
    value:"all"
  },
  {
    key:"ocean",
    text:"Ocean",
    value:"ocean"
  },
  {
    key:"air",
    text:"Air",
    value:"air"
  },
]

  const getAllDocumentsData = async (globalCarrierType,range,domainName,filterShippingLine) => {
    console.log("carrierType,range,domainName,filterShippingLine",globalCarrierType,range,domainName,filterShippingLine);
    setLoading(true);
    try {
      let response
      if (showDatePicker || domainName || filterShippingLine || globalCarrierType) {
        const domainArray = JSON.stringify(domainName) 
        const filterShippingLineArray = JSON.stringify(filterShippingLine) 
        response = await apiGET(
          `/v1/dashboardAnalysis?fromDate=${range[0]?.startDate ? range[0]?.startDate : ""}&toDate=${range[0]?.endDate ? range[0]?.endDate : ""}&domainName=${domainArray}&shippingLine=${filterShippingLineArray}&type=${globalCarrierType}`
        );
      }

      else {
        response = await apiGET(
          `/v1/dashboardAnalysis`
        );
      }
      if (response.status === 200) {
        const result = response.data.data.data
        setCounts({
          jobCount: result.jobCount,
          documentCount: result.documentsCount,
          userCount: result.userCount,
          shippingLineCount: result.shippingLineCount,
          mblCount: result.mblDocumentTypeCount,
          hblCount: result.hblDocumentTypeCount,
          mawblCount: result.mawblDocumentTypeCount,
          hawblCount: result.hawblDocumentTypeCount,
          syncCount: result.syncWithOtmDocumentCount,
          asyncCount: result.asyncWithOtmDocumentCount,
          shippingLineCounts: result.shippingLineCounts,
          domainCount: result.domainCount,
        })
        setJobList(result.jobList)
        setLastThirtyDaysUploadedDocumentArr(result.lastThirtyDaysUploadedDocumentCount)
        setDocumentUploadedByUsers(result.documentUploadedByUser)
        setDocumentUploadedByShippingLine(result.documentUploadedByShippingLine)
        setDocumentUploadedByDomain(result.documentUploadedByDomainName)

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

  const getCarriersByType = async (carrierType,range,domainName,filterShippingLine) => {
    try {
      setCarrierTypeFilterLoading(true);
      const domainArray = JSON.stringify(domainName) 
      const filterShippingLineArray = JSON.stringify(filterShippingLine) 
      const response = await apiGET(
          `/v1/dashboardAnalysis?fromDate=${range[0]?.startDate ? range[0]?.startDate : ""}&toDate=${range[0]?.endDate ? range[0]?.endDate : ""}&domainName=${domainArray}&shippingLine=${filterShippingLineArray}&type=${carrierType}`
        );                        

      if (response.status === 200) {
        setDocumentUploadedByShippingLine(response.data.data.data.documentUploadedByShippingLine)
        setCarrierTypeFilterLoading(false);
      } else if (response.status === 400) {
        setCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
          icon: "error",
        });
        
      } else {
        setCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
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
      setCarrierTypeFilterLoading(false);
    }
  };

  const getUsersByCarrierType = async (carrierType,range,domainName,filterShippingLine) => {
    try {
      setUsersByCarrierTypeFilterLoading(true);
      // let response = await apiGET(`/v1/dashboardAnalysis?type=${carrierType}`);
      const domainArray = JSON.stringify(domainName) 
      const filterShippingLineArray = JSON.stringify(filterShippingLine) 
      const response = await apiGET(
          `/v1/dashboardAnalysis?fromDate=${range[0]?.startDate ? range[0]?.startDate : ""}&toDate=${range[0]?.endDate ? range[0]?.endDate : ""}&domainName=${domainArray}&shippingLine=${filterShippingLineArray}&type=${carrierType}`
        );   
      if (response.status === 200) {
        setUsersByCarrierTypeFilterLoading(false);
        setDocumentUploadedByUsers(response.data.data.data.documentUploadedByUser)
        
      } else if (response.status === 400) {
        setUsersByCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
          icon: "error",
        });
        
      } else {
        setUsersByCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
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
      setUsersByCarrierTypeFilterLoading(false);
    }
  };

  const getDomainByCarrierType = async (carrierType,range,domainName,filterShippingLine) => {
    try {
      setDomainsByCarrierTypeFilterLoading(true);
      // let response = await apiGET(`/v1/dashboardAnalysis?type=${carrierType}`);
      const domainArray = JSON.stringify(domainName) 
      const filterShippingLineArray = JSON.stringify(filterShippingLine) 
      const response = await apiGET(
          `/v1/dashboardAnalysis?fromDate=${range[0]?.startDate ? range[0]?.startDate : ""}&toDate=${range[0]?.endDate ? range[0]?.endDate : ""}&domainName=${domainArray}&shippingLine=${filterShippingLineArray}&type=${carrierType}`
        );   
      if (response.status === 200) {
        setDomainsByCarrierTypeFilterLoading(false);
        setDocumentUploadedByDomain(response.data.data.data.documentUploadedByDomainName)
        
      } else if (response.status === 400) {
        setDomainsByCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
          icon: "error",
        });
        
      } else {
        setDomainsByCarrierTypeFilterLoading(false);
        Swal.fire({
          title: "Error!",
          text: response?.data?.data || "Carrier Line Error",
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
      setDomainsByCarrierTypeFilterLoading(false);
    }
  };

  const dataCounts = label.map((dateLabel) => {
    const matchingCount = lastThirtyDaysUploadedDocumentArr.find((item) => item.date === dateLabel.date);
    return matchingCount ? matchingCount.count : 0;
  });

  //Data of Uploaded Documents
  const data = {
    labels: label.map(item => item.date),
    datasets: [
      {
        label: `Documents uploaded this month`,
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
        label: `Document By Carrier Line`,
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

  //Data of Uploaded Documents
  const documentUploadedByDomainName = {
    labels: documentUploadedByDomain.map(item => item._id),
    datasets: [
      {
        label: `Document By Domain`,
        data: documentUploadedByDomain.map(item => item.count),
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
    labels: [`${counts.mblCount} MBL Document Type`, `${counts.hblCount} HBL Document Type`],
    datasets: [
      {
        label: 'Document Type',
        data: [counts.mblCount, counts.hblCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

   // Data for MAWBL HAWBL Documents
  const mawblHawblData = {
    labels: [`${counts.mawblCount} MAWBL Document Type`, `${counts.hawblCount} HAWBL Document Type`],
    datasets: [
      {
        label: 'Document Type',
        data: [counts.mawblCount, counts.hawblCount],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

     // Data for both air and ocean Documents
     const allCarriersData = {
      labels: [`${counts.mawblCount + counts.mblCount } MBL & MAWBL`, `${counts.hawblCount + counts.hblCount} HBL & HAWBL`],
      datasets: [
        {
          label: 'Document Type',
          data: [counts.mawblCount + counts.mblCount, counts.hawblCount + counts.hblCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

  // Data for Sync and async Documents
  const syncAsyncData = {
    labels: [`${counts.syncCount} ERP Sync : Yes`, `${counts.asyncCount}  ERP Sync : No`],
    datasets: [
      {
        data: [counts.syncCount, counts.asyncCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
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
  const getDomain = async () => {
    try {
      let response = await apiGET('/v1/domain/');
      if (response.status === 200) {
        const arr = transformData(response.data.data);
        let list = arr;
        if (list && list.length) {
          list = list.map((item) => {
            return {
              key: item,
              text: item,
              value: item,
            };
          });
        }
        setDomainOptions(list)
      } else {
        Swal.fire({
          title: 'Error!',
          text: response?.data?.data,
          icon: 'error',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
      });
    }
  };

  const getDomainOptions=()=> {
    if (user.role === "superAdmin") {
       getDomain()
    }else{
      let list = user?.domain;
      if (list && list.length) {
        list = list.map((item) => {
          return {
            key: item,
            text: item,
            value: item,
          };
        });
      }
    setDomainOptions(list)
    }
}


  useEffect(() => {
    getDomainOptions()
  }, [user])  


  useEffect(() => {
    setCarrierTypeFilterValue(globalCarrierListTypeValue)
    setUsersByCarrierTypeFilterValue(globalCarrierListTypeValue)
    setDomainsByCarrierTypeFilterValue(globalCarrierListTypeValue)
    setFilterShippingLine("")
  }, [globalCarrierListTypeValue])

  useEffect(() => {
    getAllDocumentsData(globalCarrierListTypeValue,range,domainName,filterShippingLine)
  }, [range,domainName,filterShippingLine,globalCarrierListTypeValue])



  return (
    <div className="fadeIn  page-content-wrapper">
      <div className="page-header">
        <div>
          <Breadcrumb icon="right angle" sections={sections} />
          <div className="header-text">Dashboard</div>
          <div className="sub-text">Overview for statistics</div>
        </div>
        <div className="page-header-actions" style={{display:"flex"}}>
        <div>
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
        </div>
      <div style={{marginLeft:10}}>
        <label style={{fontWeight: 500,fontSize: '14px',marginBottom:10}}>Select Mode</label>
        <Form.Dropdown
            placeholder="Select Mode"
            options={carrierTypeOption || []}
            required={true}
            selection
            onFocus={() => {
              setErrorObj();
            }}
            value={globalCarrierListTypeValue}
            onChange={(e, data) => {
              setGlobalCarrierListTypeValue(data.value);
            }}
          />
      </div>
        <div style={{marginLeft:10}}>
            <label style={{alignItems:'center',fontWeight: 500,fontSize: '14px',marginBottom:10}}>Select Carrier Line</label>
            <div>
                <ShippingLineNameDropdown multiselect={true} shippingId={filterShippingLine}shippingLineId={setFilterShippingLine} type={globalCarrierListTypeValue} />
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
              headerText="Total Carrier Line"
              icon="ship icon"
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
              count={loggedInUser?.role == 'documentation' ? 0 : counts.userCount}
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
        <div className="ui container fluid">
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

              <div className="sixteen wide tablet eight wide computer column ui segment"
                style={{ alignItems: 'center', display: 'flex' }}>
                <div className="ui container fluid ">
                  <div className="ui grid">
                    {
                      counts.mblCount > 0 || counts.hblCount > 0 || counts.mawblCount > 0 || counts.hawblCount > 0 ?
                        <div className="row">
                          <div className="seven wide tablet seven wide computer column ">
                            <Pie data={globalCarrierListTypeValue == "all" ? allCarriersData: (globalCarrierListTypeValue == "air" ? mawblHawblData : mblHblData)} style={{ width: 250, height: 250 }} />
                          </div>
                          <div className="seven wide tablet seven wide computer column">
                            <Pie data={syncAsyncData} style={{ width: 250, height: 250 }} />
                          </div>
                        </div>
                        :
                        <div style={{ textAlign: 'center', width: '100%' }}>No Data</div>
                    }
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="container-header-text"  style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p><span style={ {marginRight:10}}>Documents Uploaded By Users </span><Icon loading={usersByCarrierTypeFilterLoading} className='ui right aligned blue' name="refresh"></Icon></p>
          <Form.Dropdown
            placeholder="Select Carrier Type"
            options={carrierTypeOption || []}
            required={true}
            //   error={errorObj && errorObj.fieldId}
            selection
            onFocus={() => {
              setErrorObj();
            }}
            value={usersByCarrierTypeFilterValue}
            disabled={loading}
            onChange={(e, data) => {
              setUsersByCarrierTypeFilterValue(data.value);
              getUsersByCarrierType(data.value,range,domainName,filterShippingLine)
            }}
          />
          </div>
        <div className="ui segment">
          <Bar
            height={100}
            data={documentUploadedByUserData}
            options={options}
          />
        </div>

        <div className="container-header-text" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p><span style={ {marginRight:10}}>Documents By Carrier Line </span><Icon loading={carrierTypeFilterLoading} className='ui right aligned blue' name="refresh"></Icon></p>
          <Form.Dropdown
            placeholder="Select Carrier Type"
            options={carrierTypeOption || []}
            required={true}
            //   error={errorObj && errorObj.fieldId}
            selection
            onFocus={() => {
              setErrorObj();
            }}
            value={carrierTypeFilterValue}
            disabled={loading}
            onChange={(e, data) => {
              setCarrierTypeFilterValue(data.value);
              getCarriersByType(data.value,range,domainName,filterShippingLine)
            }}
          />
          </div>
        <div className="ui segment">
          <Bar
            height={100}
            data={documentUploadedByShippingLines}
            options={options}
          />
        </div>

        <div className="container-header-text" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p><span style={ {marginRight:10}}>Documents By Domain</span><Icon loading={domainsByCarrierTypeFilterLoading} className='ui right aligned blue' name="refresh"></Icon></p>
          <Form.Dropdown
            placeholder="Select Carrier Type"
            options={carrierTypeOption || []}
            required={true}
            //   error={errorObj && errorObj.fieldId}
            selection
            onFocus={() => {
              setErrorObj();
            }}
            value={domainsByCarrierTypeFilterValue}
            disabled={loading}
            onChange={(e, data) => {
              setDomainsByCarrierTypeFilterValue(data.value)
              getDomainByCarrierType(data.value,range,domainName,filterShippingLine)
            }}
          />
          </div>
        <div className="ui segment">
          <Bar
            height={100}
            data={documentUploadedByDomainName}
            options={options}
          />
        </div>

        {/* <div className="container-header-text">Recent Jobs</div> */}
        {/* <div className="ui segment"> */}
         {
           // jobList?.length > 0 ?
            //   <>
            //     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            //       <div className='container-sub-text'>Recently Jobs</div>
            //       {/* <div className=' container-viewmore-text'
            //         style={{ cursor: 'pointer' }}
            //         onClick={() => {
            //           navigate('/dashboard/jobs')
            //         }}>View more</div> */}
            //     </div>
            //     <div style={{ height: 10 }}></div>
            //     <table className="ui single line small table">
            //       <thead>
            //         <tr>
            //           <th>Seq Id</th>
            //           <th>BL Number</th>
            //           <th>Document No</th>
            //           <th>Created By</th>
            //           <th>Created On</th>
            //         </tr>
            //       </thead>

            //       <tbody>
            //         {
            //           jobList.map((item, index) => {
            //             return (
            //               <tr >
            //                 <td >{item.seqId}</td>
            //                 <td >{item && getBlNo(item.documentsdata?.fieldsAndValues)}</td>
            //                 <td >{item?.documentsdata?.documentNo}</td>
            //                 <td >{item?.userdata?.name ? item?.userdata?.name : "---"}</td>
            //                 <td className="column-sub-text"><><p>{moment(item?.createdAt).format('DD/MM/YYYY')}</p>{moment(item?.createdAt).format('H:MM a')}</></td>
            //               </tr>
            //             )
            //           })
            //         }
            //       </tbody>
            //     </table>
            //   </>
            //   :
            //   <div style={{ textAlign: 'center' }}>No Records Found</div>
          }
        {/* </div> */}
        <div style={{ height: 70 }}></div>

      </div>
    </div>
  );
}



const CardComponent = ({ headerText, icon, seriesCount, count }) => (
  <div className="eight wide tablet five wide computer column"  >
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
