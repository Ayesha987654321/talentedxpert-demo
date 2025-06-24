import React from 'react'
import Image from "next/image";
import { Icon } from '@iconify/react';
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from 'zod';
import { LoginSchema } from '@/schemas/login-schema/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { dataForServer } from '@/models/loginModel/loginModel';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/Store';
import { saveToken, setAuthState } from '@/reducers/AuthSlice';


const ForgotPassword = () => {
  return (

    <div>
<section className='sign-in mb-5'>
      <div className='container'>
        <div className='row mt-5 forpadding'>
          <div className='col-md-8 mx-auto'>
            <div className="card bg-tertiary">
              <div className="card-body mx-4 my-4">
                <div className='row'>
                  <div className='col-md-8 mx-auto'>
                    <form>
                      <h4 className='text-center'>Forgot Password?</h4>
                      <p className='fw-medium fs-12 text-center'>{`No worries, we'll send you reset instructions.`}</p>
                      
                     
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email <span className='text-danger'>*</span> </label>
                        <input type="email" className="form-control bg-dark" id="email" placeholder="Enter your email"></input>
                        {
                           (
                            <div className="text-danger pt-2"></div>
                          )
                        }
                      </div>
                    
                    
                      <div className='text-end mb-3'>
                        <button type="submit" className="btn btn-info rounded-pill signin-btn">Send Email</button>
                      </div>
                      <div className='d-flex justify-content-between align-items-center flex-wrap mb-3'>
                        <div className="form-check">
                           <label className="form-check-label me-2" htmlFor="rememberMe">
                           
                          </label>
                        </div>
                        <a className='fw-medium text-dark forget'>Back to login</a>
                      </div>
                    
                   
                   
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >

    </div>
  )
}

export default ForgotPassword