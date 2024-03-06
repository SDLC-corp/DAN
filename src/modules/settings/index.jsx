import React from 'react'
import { Breadcrumb, Button, Dropdown, Header, Icon, Input, Label, List, Menu, Modal, Popup, Search, Sidebar, Table } from 'semantic-ui-react';


const Setting = () => {



  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'Documents List', content: 'Setting', active: true },
  ];


  return (
    <div>
      {/* <div>
        <Breadcrumb icon="right angle" sections={sections} />
        <div className="header-text">All document list</div>
        <div className="sub-text">List of all document List</div>
      </div> */}
      <div className="page-header" >
            <div>
              <Breadcrumb icon="right angle" sections={sections} />
              <div className="header-text">Setting</div>
              <div className="sub-text">List of all document List</div>
            </div>
          </div>
    </div>
  )
}

export default Setting