'use client'
import { dataForServer } from '@/models/loginModel/loginModel'
import { saveToken, setAuthState } from '@/reducers/AuthSlice'
import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { RootState, useAppDispatch } from '@/store/Store'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const ProfileType = ({ isOpen, onClose, data, setIsFormSubmitted }: any) => {
  const user = useSelector((state: RootState) => state.user)
  const [open, setOpen] = useState<boolean>(false)
  const dispatch = useAppDispatch();
  const router = useRouter()
  const [type, setType] = useState<string>('')

  useEffect(() => {
    setOpen(true)
    setType('')
  }, [isOpen])

  const handleClose = () => {
    onClose();
    setType('')
  }

  const handleSubmit = async () => {
    if(type===''){
      toast.error('Select Profile type')
    }
    else{
    const formData = dataForServer(data)    

    await apiCall(requests.login, formData, 'post', true, dispatch, null, null).then((res: any) => {
      if (res?.error) {
        toast.error(res?.error?.message || 'Something went wrong')
        setIsFormSubmitted(false)
      } else {
        dispatch(saveToken(res.data.access_token))
        localStorage?.setItem("accessToken", res.data.access_token)  
        dispatch(setAuthState(true))
        setIsFormSubmitted(true)
        localStorage.setItem('access', 'true');
        localStorage.setItem('profileType', type)
        handleClose()
        router.push('/dashboard')


      }
    }).catch(err => {
      setIsFormSubmitted(false)
      console.warn(err)
    })
    }
  }


  return (
    <>
      {open &&
        <div className="modal fade show" style={{display:'block',backgroundColor:'rgba(0, 0, 0, 0.75)'}} id="exampleModalToggle2" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabIndex={1}>
          <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-black" id="exampleModalToggleLabel2">Login as <aside></aside></h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="form-check radio me-4">
              <input className="form-check-input" type="radio" name="profileType" id="profileType1" value="TE" onChange={(e) => setType(e?.target?.value)} />
              <label className="form-check-label" htmlFor="profileType1">
                TalentedXpert
              </label>
            </div>
            <div className="form-check radio me-3">
              <input className="form-check-input" type="radio" name="profileType" id="profileType1" value="TR" onChange={(e) => setType(e?.target?.value)} />
              <label className="form-check-label" htmlFor="profileType1">
                TalentRequestor
              </label>
            </div>
                </div>

              </div>
              <div className="modal-footer">
                <div className="d-grid gap-2">

                </div>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </div>}
    </>
  )
}

export default ProfileType
