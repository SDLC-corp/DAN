import React from 'react';
import {  Image } from 'semantic-ui-react';
import svgDescription from '../../assets/image1.svg';
import toplines from '../../assets/toplines.svg';
import downLine from '../../assets/Group410.svg'
import bottomLogo from "../../assets/Group109.svg"
function DataGeoComp() {
  return (
    <div style={{ maxWidth: '100%', height: '94%', margin: '20px', backgroundColor: '#048def', borderRadius: '20px', position: 'relative',padding: '10px', overflow: 'hidden' }}>

      <Image style={{position: 'absolute', top: '0px', left: '18px', zindex: '1', marginRight: '10px', borderRadius: '20px', maxWidth: '100%', height: '59%', objectFit: 'cover', opacity: '0.57'}} 
      src={toplines} alt="line upper img" />

      <div style={{ position:'relative', top: '55px', left: '35px', width: '266px', display:'flex'}}>
        <Image src={svgDescription} alt="Description of the SVG image" />
          <h5 style={{color:'white', margin:0, position: 'relative', top: '20px', left: '13px', fontSize: '24px'}}>Data Geometry</h5>
      </div>
      
      <Image style={{position: 'absolute', zIndex: '1',left: '0px', width: '100%', height: 'auto', opacity: '0.57'}} src={downLine}
       alt="Group img" />

      <div>
        <p style={{position: 'relative', top: '85px', left: '35px', color: 'white', fontSize: '35px', fontWeight: '500', width: '96.6%'}}>
          Welcome to Data Geometry,
          <br />
          Where AI meets precision
          <br />
          in data extraction.
        </p>
        <p style={{position: 'relative', top: '70px', left: '35px', color: 'white', fontSize: '23px', width: '96.5%'}}>
          Transforming raw data into actionable<br/>insights, effortlessly. 
        </p>
      </div>
      
      <div style={{height: '23%', width: '97.5%', backgroundColor: '#0369CA', borderRadius: '10px', bottom: '10px', position: 'absolute', zIndex: '1'}}>
        <p style={{color: 'white', fontWeight: '700', fontSize: '20px',position: 'absolute', left: '18px', top: '12px', margin: '0px'}}>Document We Support</p>
        <div style={{ position: 'absolute', left: '1%', top: '40%', height: '60px'}}>
        <span style={{left: '0%', top: '0%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Invoices</span>
        <span style={{left: '20%', top: '0%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Receipts</span>
        <span style={{left: '40%', top: '0%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Indetity Documents</span>
        <span style={{left: '60%', top: '0%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Health Insurance Cards</span><br/>
        <span style={{left: '0%', top: '50%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax W-2</span>
        <span style={{ left: '20%', top: '50%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax 1098</span>
        <span style={{left: '40%', top: '50%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >UX Tax 1099</span>
        <span style={{ left: '60%', top: '40%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >Contracts</span>
        <span style={{left: '80%', top: '20%',paddingRight: '10px', paddingLeft: '10px', paddingTop: '3px', paddingBottom: '3px' ,fontSize: '12px', color: 'white', backgroundColor: 'rgb(240, 240, 240, 0.3)', margin: '5px', borderRadius: '43px', display: 'inline-block'}} >and more...</span>
        </div>
      <Image style={{position: "absolute", zIndex: '1', left: '70%', bottom: '0px'}} src={bottomLogo} alt="Group img"/>

      </div>
      
    </div>
  );
}

export default DataGeoComp;
