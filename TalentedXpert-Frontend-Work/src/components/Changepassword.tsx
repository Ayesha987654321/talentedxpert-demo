import React from 'react'

const Changepassword = () => {
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
                      <h4 className='text-center'>Check your email</h4>
                      <p className='fw-medium fs-12 text-center'>Please enter your 6-digit code. Then create and confirm your new password.</p>
                      
                     
                      <div className="mb-2">
                        <label htmlFor="email" className="form-label">6-digit code  <span className='text-danger'>*</span> </label>
                        <input type="email" className="form-control bg-dark" id="email" placeholder="Enter your code"></input>
                        {
                           (
                            <div className="text-danger pt-2"></div>
                          )
                        }
                      </div>
                      <div className="mb-2">
                        <label htmlFor="email" className="form-label">New Password  <span className='text-danger'>*</span> </label>
                        <input type="email" className="form-control bg-dark" id="email" placeholder="New Password"></input>
                        {
                           (
                            <div className="text-danger pt-2"></div>
                          )
                        }
                      </div>
                      <div className="mb-2">
                        <label htmlFor="email" className="form-label">Confirm Password  <span className='text-danger'>*</span> </label>
                        <input type="email" className="form-control bg-dark" id="email" placeholder="Confirm Password"></input>
                        {
                           (
                            <div className="text-danger pt-2"></div>
                          )
                        }
                      </div>
                      <div className='d-flex justify-content-between align-items-center flex-wrap mb-3'>
                        <div className="form-check  ps-1">
                           <label className="form-check-label " htmlFor="rememberMe">
                           Password must match
                          </label>
                        </div>
                        <a className='fw-medium text-dark forget'></a>
                      </div>
                    
                      <div className='text-end mb-2'>
                        <button type="submit" className="btn btn-info rounded-pill signin-btn">Reset Password</button>
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

export default Changepassword