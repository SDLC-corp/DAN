import React, { useState } from 'react';
import 'rc-tree/assets/index.css';
import { Breadcrumb } from 'semantic-ui-react';
import NestedDomain from '../../components/nodetree/nestedDomain';

const MyTreeComponent = () => {
    const sections = [
        { key: 'Dashboard', content: 'Dashboard', link: true },
        { key: 'Manage Domain', content: 'Manage Domain', active: true },
    ];
    const [selectedNodePath, setSelectedNodePath] = useState([]);

    return (
      <div>
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">All Domain</div>
            <div className="sub-text">List of all Domain</div>
          </div>
        </div>
        <div className="page-body" style={{ minHeight: '100vh' }}>
          <div>
            <NestedDomain nodePathFn={setSelectedNodePath} hideActionBtn={true} />
            <div style={{marginTop: 12}}>
              {
                selectedNodePath?.map((item)=>{
                  return(
                    <div >{item.text}</div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
};


export default MyTreeComponent;
