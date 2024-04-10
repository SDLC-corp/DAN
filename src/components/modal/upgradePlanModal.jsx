import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Image } from 'semantic-ui-react';
import Logo from '../../assets/upage.svg'

const UpgradePlanModal = ({isModalOpen, setIsModalOpen}) => {
    const navigate = useNavigate();
  return (
    <Modal
    open={isModalOpen}
    closeIcon={'close'}
    onClose={() => setIsModalOpen(!isModalOpen)}
    closeOnDimmerClick={false}
    style={{  borderRadius: '20px', width:'700px', height: '400px',padding:'0' }}
    >
    <div style={{position: 'relative', display: "flex", justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
    <Image src={Logo} alt="Description of the SVG image" style={{ width: '130px', height: '130px', position:  'absolute', top: '20px', zIndex: '1', padding: '5px' }} />
        <div className='' style={{height: "300px", width:"100%", position: "absolute", top:  '100px', zIndex: '0', borderRadius: "15px", alignContent: 'center', display: "flex", justifyContent: 'center'}}>
            <div style={{position: 'absolute', top:  '70px', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: "20px"}}>
                <span style={{fontSize: "30px", fontWeight: '900'}}>Unlock the Power of Data Extraction:
 </span>
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '10px'}}>

                <span style={{fontSize:  "20px", fontWeight: "600", textAlign:'center', lineHeight:'25px', margin:'0 30px', color:'gray'}}>Your free trial limit of 10 document uploads has been reached. Please upgrade your plan to continue using this feature. </span>
                <span style={{fontSize:  "20px", fontWeight: "600"}}></span>
                </div>
            </div>
            
      </div>
      <Button onClick={()=>{navigate('/dashboard/upgrade-plan')}} style={{ position: 'absolute', top: '300px' , backgroundColor: '#048def', color: 'white', borderRadius: "28px", padding: "15px"}}>
    Upgrade Plan
  </Button>
    </div>
      
    </Modal>
  );
};

export default UpgradePlanModal;
