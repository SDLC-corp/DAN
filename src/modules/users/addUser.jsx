import React, { useContext, useEffect, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Icon,
  Form,
  Input,
  Modal
} from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { apiGET, apiPOST } from '../../utils/apiHelper';
import Swal from 'sweetalert2';
import ImageUploadDrop from '../../components/imageuploader/imageUploadDropzone';
import DEFAULTIMG from '../../assets/images/default.png';
import MultiSelectDomain from './multiSelectDomain';
import { AuthContext } from '../../contexts';

function AddUser(Props) {
  const { user } = useContext(AuthContext);
  const [nodeTreeValue, setNodeTreeValue] = useState()
  const [approvalDomainArray, setApprovalDomainArray] = useState([])
  const { id } = useParams();
  const [updatePassModal, setUpdatePassModal] = useState(false)
  const [updatePass, setUpdatePass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [passError, setPassError] = useState()
  const [rolesData, setRolesData] = useState([])
  const [roleName, setRoleName] = useState("")
  const { action } = useParams();
  const passwordRegX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const sections = [
    { key: 'Dashboard', content: 'Dashboard', link: true },
    { key: 'User List', content: 'User List', link: true },
    { key: (action === 'View') ? "View User" : id ? 'Edit User' : 'Add User', content: (action === 'View') ? "View User" : id ? 'Edit User' : 'Add User', active: true },
  ];

  const [userObj, setUserObj] = useState({
    name: '',
    email: '',
    password: '',
    domain: '',
    roleId:'',
  })
  const [Error, setError] = useState()
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("")
  let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  const validate = (data) => {
    if (!data.name || data.name.trim() === '') {
      setError({ ...Error, name: "Name is a required field" })
      return false
    }
    else if (!regex.test(data.email)) {
      setError({ ...Error, email: "Invalid Email" })
      return false
    }
    else if (!data.email || data.email.trim() === '') {
      setError({ ...Error, email: "Email is a required field" })
      return false
    }
    else if (!id && (!data.password || data.password.trim() === '')) {
      setError({ ...Error, password: "Password is a required field" })
      return false
    }
    else if (!id && !passwordRegX.test(data.password)) {
      setError({ ...Error, password: "Password is not valid." })
      return false
    }
    else if ((nodeTreeValue < 1)) {
      setError({ ...Error, domain: "Domain required" })
      return false
    }
    return true
  }

  const validatePass = (pass1,pass2) => {
    if (!pass1 || pass1.trim() === '') {
      setPassError({ ...passError, updatePass: "Update password is a required field" })
      return false
    }else if (!passwordRegX.test(pass1)) {
      setPassError({ ...passError, updatePass: "Update password is not valid." })
      return false
    } 
    else if (!pass2 || pass2.trim() === '') {
      setPassError({ ...passError, confirmPass: "Confirm password is a required field" })
      return false
    }else if (!passwordRegX.test(pass2)) {
      setPassError({ ...passError, confirmPass: "Confirm password is not valid." })
      return false
    } 
    else if (pass1 !== pass2) {
      setPassError({ ...passError, notMatch: "Passwords do not match. Please try again." })
    return false
    }
    return true
  }

  const clearFields = () => {
    setUserObj({
      name: '',
      email: '',
      password: '',
      domain: '',
      roleId:'',
    })
    setProfilePic("")
    setNodeTreeValue([])
    setApprovalDomainArray([])
    Props.setVisible(false)
    Props.setViewUser(false)
    setError(false)
  }

    const clearPassFields =()=>{
        // setPassError(false)
        setUpdatePass("")
        setConfirmPass("")
        setUpdatePassModal(false)
        setPassError(false)
    }


  //Get User By Id
  const getUserById = async () => {
    try {
      const response = await apiGET(`/v1/users/${id}`)
      if (response.status === 200) {
        const user = response.data.data
        setNodeTreeValue(user.domain)
        if (user?.approvalDomain) {
            setApprovalDomainArray(user.approvalDomain)
        }
        setUserObj({
          name: user.name,
          email: user.email,
          password: user.password,
          domain: user.domain,
          profilePic: user.profilePic,
          roleId: user.roleId
        })
        setProfilePic(user.profilePic)
      } else {
        Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
      }

    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }
  //Add User
  const onClickAddUser = async () => {
    try {
      const isValidated = await validate(userObj);
      if (isValidated) {
        let payload = {
          name: userObj.name,
          email: userObj.email,
          password: userObj.password,
          domain: nodeTreeValue,
          approvalDomain: approvalDomainArray,
          profilePic: profilePic,
        //   role: userObj.role,
          roleId: userObj.roleId
        }
        setLoading(true)
        const response = await apiPOST('/v1/auth/register', payload);
        if (response.status === 201) {
          Swal.fire({
            title: 'Success!',
            text: 'User created successfully!',
            icon: 'success',
          })
          clearFields();
          Props.getAllUsers()
        } else {
          Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
        }
      }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    } finally {
      setLoading(false);
    }
  }


  //Update User
  const onClickUpdateUser = async () => {
    try {
      if (loading) return
      const isValid = await validate(userObj)
      if (isValid) {
        setLoading(true)
        let payload = {
          name: userObj.name,
          domain: nodeTreeValue,
          approvalDomain: approvalDomainArray,
          profilePic: profilePic,
          roleId: userObj.roleId,
        //   role: userObj.role
        }
        const response = await apiPOST(`v1/users/${id}`, payload)
        if (response.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "User Updated successfully",
            icon: "success",
          })
          clearFields();
          Props.getAllUsers()
        }
        else {
          Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
        }
        setLoading(false)
      }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

  const onClickUpdateUserWithPassword = async () => {
    try {
      const isValid = await validatePass(updatePass,confirmPass)
        if (isValid) {
            // setLoading(true)
            const response = await apiPOST(`v1/users/update-user-with-pass/${id}`, {password:updatePass})
            if (response.status === 200) {
                clearPassFields()
                Swal.fire({
                    title: "Success!",
                    text: "Password Updated successfully",
                    icon: "success",
                })
            }
            else {
                clearPassFields()
                Toast.fire('Error!', response?.data?.data || "Something went wrong!", 'error');
            }
        }
    } catch (error) {
      Toast.fire('Error!', error || "Something went wrong!", 'error');
    }
  }

const getAllRoles = async () => {
    try {
        setLoading(true);
        let response = await apiGET(`/v1/role/all`)
        setLoading(false);
        if (response.status === 200) {
            // [{ text: "Admin", value: "admin" }, { text: "Documentation", value: "documentation" }]
            const result = response?.data?.data?.data
            let list = result?.map(item => {
                return {key:item._id, text:item.name, value: item._id}
            })
            setRolesData([...list])
            // setRole(response?.data?.data?.data);
            // setTotalRows(response?.data?.data?.totalCount);
            // setLimit(response?.data?.data?.limit)
            // setPage(response?.data?.data?.page)
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

    useEffect(() => {
      getAllRoles()
    }, [])
    

  useEffect(() => {
    // if (Props.visible == false && openModalTree == false) {
    if (Props.visible == false) {
      clearFields()
    }
  }, [Props.visible == false])

  useEffect(() => {
    if (id) {
      getUserById()
    }
  }, [id])

    useEffect(() => {
        delete Error?.domain 
    }, [nodeTreeValue,Error?.domain])
    
    useEffect(() => {
      if (rolesData.length) {
        let roleItem  = rolesData?.find(item=> item.value == userObj.roleId)
        if (roleItem?.text) {
          setRoleName(roleItem.text)
        } 
      }
    }, [userObj.roleId, Props.ViewUser])

  return (
    <div className="fadeIn page-content-wrapper">
      <div className="page-header">
        <div>
          <Breadcrumb icon="right angle" sections={sections} />
          <div className="header-text">  {(action === 'View') ? "View User" : id ? "Edit User" : "New Users"}</div>
          <div className="sub-text">  {(action == "View") ? "Users Detail are shown here" : id ? "Proceed to Edit User" : "Proceed to create new users here."}</div>
        </div>
        <div className="page-header-actions">
          <Button icon
            onClick={() => {
              clearFields()
            }} >
            <Icon name='close' />
          </Button>
        </div>
      </div>
      <div className="page-body">
        <Form style={{ width: '100%', marginTop: -20, marginBottom: -20 }}>
          <Form.Group widths="equal">
            {

              Props.ViewUser || Props?.stateAction ?
                <Form.Field
                  id="form-input-control-first-name"
                  control={Input}
                  label="Name"
                  placeholder="Name"
                  required={true}
                  value={userObj.name}
                ></Form.Field>
                :
                <Form.Field
                  id="form-input-control-first-name"
                  control={Input}
                  label="Name"
                  placeholder="Name"
                  required={true}
                  value={userObj.name}
                  onChange={(e) => {
                    setUserObj({ ...userObj, name: e.target.value })
                    delete Error?.name
                  }}
                  onFocus={() => { setError(false) }}
                  error={Error && Error.name}
                />}
          </Form.Group>

          <Form.Field
            id="form-input-control-error-email"
            control={Input}
            label="Email"
            placeholder="Email"
            required={true}
            onFocus={() => { setError(false); }}
            value={userObj.email}
            disabled={id ? true : false}
            onChange={(e) => {
              setUserObj({ ...userObj, email: e.target.value })
              delete Error?.email
            }}
            error={Error && Error.email}
          />
          {

            Props.ViewUser || Props?.stateAction ?
              <Form.Field
                id="form-input-control-error-email"
                control={Input}
                label="Role"
                placeholder="Role"
                required={true}
                value={roleName}
              ></Form.Field>
              :
              <Form.Dropdown
                label="Select Role"
                placeholder="Select Role"
                options={rolesData}
                required={true}
                selection
                onFocus={() => {
                  delete Error?.roleId
                }}
                value={userObj.roleId}
                onChange={(e, data) => {
                  setUserObj({ ...userObj, roleId : data.value});
                }}
              />}
          {
            id ? null :
              <Form.Field
                type='password'
                id="form-input-control-error-email"
                control={Input}
                label="Password"
                placeholder="Password"
                required={true}
                onFocus={() => { setError(false); }}
                value={userObj.password}
                disabled={id ? true : false}
                onChange={(e) => {
                    let password = e.target.value
                    setUserObj({ ...userObj, password })
                }}
                error={Error && Error.password}
                autoComplete="new-password"
              />
          }

          {
            Props.ViewUser || Props?.stateAction ?
              <Form.Field
                id="form-input-control-error-email"
                control={Input}
                label="Access Domains"
                placeholder="Domain"
                required={true}
                value={nodeTreeValue}
              ></Form.Field>
              :<>
                <Form.Field
                id="form-input-control-error-email"
                label="Access Domains"
                required={true}
                style={{marginBottom:5}}
              />
                {
                <MultiSelectDomain 
                    id={id} nodeTreeValue={nodeTreeValue} 
                    setNodeTreeValue={setNodeTreeValue} 
                    setVisible={Props.setVisible}
                    error={Error}
/>
                }
            </>
          }
          {
             Props.ViewUser || Props?.stateAction 
                ? <Form.Field
                id="form-input-control-error-email"
                control={Input}
                label="Approver Domains"
                placeholder="Domain"
                required={true}
                value={approvalDomainArray}
              ></Form.Field>
              :<>
                <Form.Field
                id="form-input-control-error-email"
                label="Approver Domains"
                // required={true}
                style={{marginBottom:0, marginTop:10}}
              />
                {
                <MultiSelectDomain 
                    id={id} nodeTreeValue={approvalDomainArray} 
                    setNodeTreeValue={setApprovalDomainArray} 
                    setVisible={Props.setVisible}
                    // error={Error}
                />
                }
            </>
          }
          <Form.Field
            width={4}
            id="form-input-control-token-tracker"
            label="Upload Cover Image"
            style={{ marginTop: "16px", marginBottom: -5 }}
          ></Form.Field>
          {
          Props.ViewUser || Props?.stateAction ?
            <img src={profilePic == "/default.png" || profilePic == '' ? DEFAULTIMG : profilePic } height={100} width={100} style={{ display: "flex", margin: "auto" }} />
            : <ImageUploadDrop
              setImage={setProfilePic}
              imageUrl={profilePic == "/default.png" ? DEFAULTIMG : profilePic}
              assetLayoutType={"cover-image"}
              uploadType="collection"
              onUploadDone={(data) => {
                setProfilePic(data);
              }}
            />
            }

        </Form>

      </div>
      {
        Props.ViewUser || Props?.stateAction ? null :
          <div className="page-footer">
            <Button
              animated="fade"
              onClick={() => {
                clearFields()
              }
              }
            >
              <Button.Content visible disabled={loading}> Close</Button.Content>
              <Button.Content hidden>
                <Icon name="close" />
              </Button.Content>
            </Button>
            <div>
            { (user.role == "superAdmin" && id) && <Button
              onClick={() => {setUpdatePassModal(true)}}>
              <Button.Content visible>Update Password</Button.Content>
            </Button>}

            <Button
              className={
                loading ? "ui primary button loading" : "ui primary button"
              }
              animated="fade"
              loading={loading}
              disabled={loading}

              onClick={id ? onClickUpdateUser : onClickAddUser}>
              <Button.Content visible
              >
                {id ? "Update User" : "Create User"}
              </Button.Content>
              <Button.Content hidden>
                <Icon name="save" />
              </Button.Content>
            </Button>
            </div>
          </div>
      }


      {
        <Modal onFocus={
          updatePassModal 
        } open={updatePassModal} onClose={clearPassFields}>
          <Modal.Header>Upadate Password</Modal.Header>
          <Modal.Content>
            <Form>
                <Form.Field
                    type='password'
                    id="form-input-control-error-email"
                    control={Input}
                    label="Password"
                    placeholder="Enter Password"
                    required={true}
                    onFocus={() => { setPassError(false); }}
                    value={updatePass}
                    onChange={(e) => {
                        setUpdatePass(e.target.value)
                        delete passError?.updatePass
                        delete passError?.notMatch
                    }}
                    error={passError && passError.updatePass}
                    autoComplete="new-password"
                />
                <Form.Field
                    type='password'
                    id="form-input-control-error-email"
                    control={Input}
                    label="Confirm Password"
                    placeholder="Enter Confirm Password"
                    required={true}
                    onFocus={() => { setPassError(false); }}
                    value={confirmPass}
                    onChange={(e) => {
                    setConfirmPass(e.target.value)
                        delete passError?.confirmPass
                        delete passError?.notMatch
                    }}
                    error={passError && passError.confirmPass
}
                    autoComplete="new-password"
                />
            </Form>
                {
                    passError?.notMatch &&<span style={{color:"red"}}>{passError.notMatch}</span>
                }
          </Modal.Content>
          <Modal.Actions style={{display:"flex",justifyContent:"space-between"}}>
            <Button  onClick={clearPassFields}>
             close
            </Button>
            <Button  onClick={() => {
                    onClickUpdateUserWithPassword()
            }}>
              Update Password
            </Button>
          </Modal.Actions>
        </Modal>
      }
    </div >
  );
}
export default AddUser;