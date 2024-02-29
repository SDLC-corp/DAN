import React from 'react';


function DataGeoComp() {
  return (
    <div style={{ maxWidth: '100%', height: '94%', margin: '20px', backgroundColor: '#048def', borderRadius: '20px', position: 'relative',padding: '10px', overflow: 'hidden' }}>

      <img style={{position: 'absolute', top: '0px', left: '18px', zindex: '1', marginRight: '10px', borderRadius: '20px', maxWidth: '100%', opacity: '0.57'}} 
      src="/src/assets/toplines.svg" alt="line upper img" />

      <div style={{ position:'relative', top: '55px', left: '40px', width: '266px', display:'flex'}}>
        <img src="/src/assets/image1.svg" alt="Description of the SVG image" />
          <h5 style={{color:'white', margin:0, position: 'relative', top: '20px', left: '13px', fontSize: '24px'}}>Data Geometry</h5>
      </div>
      
      <img style={{position: 'absolute', zIndex: '1',left: '0px', width: '100%', height: 'auto', opacity: '0.57'}} src="/src/assets/Group410.svg" alt="Group img" />

      <div>
        <p style={{position: 'relative', top: '85px', left: '40px', color: 'white', fontSize: '35px', fontWeight: '500', width: '96.6%'}}>
          Welcome to Data Geometry,
          <br />
          Where AI meets precision
          <br />
          in data extraction.
        </p>
        <p style={{position: 'relative', top: '70px', left: '40px', color: 'white', fontSize: '23px', width: '96.5%'}}>
          Transforming raw data into actionable<br/>insights, effortlessly. 
        </p>
      </div>
      
      <div style={{height: '151px', width: '97.5%', backgroundColor: '#0369CA', borderRadius: '10px', bottom: '10px', position: 'absolute', zIndex: '1'}}>
        <p style={{color: 'white', fontWeight: '700', fontSize: '20px',position: 'absolute', left: '18px', top: '12px', margin: '0px'}}>Document We Support</p>
        <div style={{ position: 'absolute', left: '18px', top: '60px', height: '60px'}}>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Invoices</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Receipts</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Indetity Documents</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Health Insurance Cards</span><br/>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax W-2</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax 1098</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax 1099</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Contracts</span>
        <span style={{paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >and more...</span>
        </div>
      </div>
      <img style={{position: "absolute", zIndex: '1', left: '672px', bottom: '9px'}} src="/src/assets/Group109.svg" alt="Group img"/>
      
    </div>
  );
}

export default DataGeoComp;
