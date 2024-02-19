import React, { useState, useEffect, useContext } from 'react';
import { Breadcrumb, Sidebar} from 'semantic-ui-react';
import { AuthContext } from '../../contexts';
import { AIR, OCEAN, hasAccess } from '../../utils/accessHelper';
import AirDocumentUpload from '../../components/documentUpload/airDocumentUpload';
import OceanDocumentUpload from '../../components/documentUpload/oceanDocumentUpload';


export default function labelsManagement() {
  const { user } = useContext(AuthContext);
  const [shippingType, setShippingType] = useState('');

  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'label_List', content: 'Document Upload', active: true },
    { key: shippingType, content: shippingType == "air"?"Air":"Ocean", active: true },
  ];

  const handleTabChangeShippingLine = (val) => {
    setShippingType(val);
  };
  const handleCarrierType = () => {
    if (hasAccess(AIR) && !hasAccess(OCEAN)) {
      setShippingType('air');
    } else if (hasAccess(OCEAN)) {
      setShippingType('ocean');
    }
  };

  useEffect(() => {
    handleCarrierType();
  }, [user.accessModules]);

    

  return (
    <Sidebar.Pushable>
      <Sidebar.Pusher className="fadeIn">
        <div className="page-header">
          <div>
            <Breadcrumb icon="right angle" sections={sections} />
            <div className="header-text">Document Upload</div>
            <div className="sub-text">
              Upload document to extract the fields
            </div>
          </div>
        </div>
            <span>
              <div class="ui pointing secondary menu">
                {  hasAccess(OCEAN) && <a class={`${shippingType == "ocean" && "active"} item`} onClick={()=>handleTabChangeShippingLine("ocean")}>Ocean</a>}
                {  hasAccess(AIR) && <a class={`${shippingType == "air" && "active"} item`} onClick={()=>handleTabChangeShippingLine("air")}>Air</a>}
              </div>     
            </span>
        <div style={{ padding: 25, flex: 1 }} >
          {
            shippingType == "ocean"
            ?  <OceanDocumentUpload />
            :  <AirDocumentUpload  />
          }
        </div>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

