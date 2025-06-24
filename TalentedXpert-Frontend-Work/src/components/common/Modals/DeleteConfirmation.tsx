import React from 'react'

const DeleteConfirmation = ({ onClickFunction, type, id }: any) => {
    return (
        <div className='ad-dispute'>
            <div className="modal fade" id="exampleModalToggle24" aria-hidden="true" aria-labelledby="exampleModalToggleLabel24" tabIndex={1}>
                <div className="modal-dialog  modal-dialog-centered  ">
                    <div className="modal-content modal-content-center ">

                        <div className="modal-header">
                            <h5 className="modal-title text-white" id="exampleModalToggleLabel24">⚠ Confirmation</h5>
                            {/* <h5 className="modal-title">⚠ Confirmation</h5> */}
                            <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">

                            <div className="mb-3 ">
                                <label htmlFor="exampleFormControlTextarea1" className="form-label">{`Are you sure you want to delete this ${type}? This action cannot be undone.`}</label>
                            </div>


                        </div>
                        <div className="modal-footer">
                            <div className="d-grid gap-2">

                            </div>

                            <button className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" >Cancel</button>
                            <button className="btn btn-outline-danger" data-bs-dismiss="modal" aria-label="Close" onClick={() => onClickFunction(id)} >Delete </button>
                            {/* <button type="submit" className="btn btn-primary" onClick={() => onClickFunction(id)}>Delete Task </button> */}
                        </div>
                    </div>

                </div>
            </div>





        </div>
    )
}

export default DeleteConfirmation
