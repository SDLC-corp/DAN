import React from 'react'

const UnAuthorized = () => {
  return <div style={{display:"flex",alignItems:"center",justifyItems:"center",width:"100%",minHeight:"50vh"}}>
        <div style={{margin:"auto"}}>
            <h1 style={{textAlign: "center"}} >Unauthorized !</h1>
            <p>You don't have permission to access this page.</p>
        </div>
    </div>
}

export default UnAuthorized