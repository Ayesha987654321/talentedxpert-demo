import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const Walletscreen = () => {
  return (
    <div>
      <div className="walletscreen Top-card d-flex gap-2 pb-2">
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Pending Balance</h3>
          <span>$</span>
        </div>
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Available Soon Balance</h3>
          <span>$</span>
        </div>
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Available Balance</h3>
          <span>$</span>
        </div>
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Received Balance</h3>
          <span>$</span>
        </div>
      </div>
      <div className="filtersearch d-lg-flex d-md-flex d-sm-flex align-items-center justify-content-between flex-wrap p-2 px-2">
        <div className="filters align-items-center ">
          <select
            className="form-select form-select-sm me-1"
            aria-label=".form-select-sm example"
          >
            <option value="">All</option>
            <option value="0">Disability</option>
            <option value="1">Promoted</option>
          </select>

          <select
            className="form-select form-select-sm mx-1"
            aria-label=".form-select-sm example"
          >
            <option value="0">Rating</option>
            <option value="2">2 star</option>
            <option value="4">4 star</option>
          </select>

          <select
            className="form-select form-select-sm mx-1"
            aria-label=".form-select-sm example"
          >
            <option value="0">Earning</option>
            <option value="1">$100 to $200</option>
            <option value="2">$400 to $1000</option>
          </select>

          <select
            className="form-select form-select-sm mx-1"
            aria-label=".form-select-sm example"
          >
            <option value="">Amount</option>
            <option value="FIXED">Fixed</option>
            <option value="HOURLY">Hourly</option>
          </select>
        </div>

        <div
          className="card-right-heading bg-info text-white d-flex justify-content-between ad-new cursor-pointer "
          data-bs-target="#exampleModalToggle2"
          data-bs-toggle="modal"
        >
          <span className="me-3 w-s">Add New Member</span>
          <Icon
            icon="line-md:plus-square-filled"
            className="text-dark"
            width={32}
            height={32}
          />
        </div>
      </div>
      <table className="table ">
        <thead className="table-light">
          <tr>
            <th scope="col" className="nr">
              Serial Number
            </th>
            <th scope="col">DATE</th>
            <th scope="col">TYPE</th>
            <th scope="col">DESCRIPTION</th>
            <th scope="col">DEBIT</th>
            <th scope="col">CREDIT</th>
            <th scope="col">BALANCE</th>
            <th scope="col">STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr className="table-dark">
            <th scope="row">01</th>
            <td>12/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
          <tr className="table-dark">
            <th scope="row">02</th>
            <td>12/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
          <tr className="table-dark">
            <th scope="row">03</th>
            <td>16/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
          <tr className="table-dark">
            <th scope="row">04</th>
            <td>14/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
          <tr className="table-dark">
            <th scope="row">05</th>
            <td>13/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
          <tr className="table-dark">
            <th scope="row">06</th>
            <td>12/06/2024</td>
            <td>Received</td>
            <td>Sevilleta_LTER_NM_2001_NPP</td>
            <td>5.00</td>
            <td>7</td>
            <td>$30000</td>
            <td>PAID</td>
          </tr>
        </tbody>
      </table>
      <div className="">
        <div
          className="modal fade"
          id="exampleModalToggle2"
          aria-hidden="true"
          aria-labelledby="exampleModalToggleLabel2"
          tabIndex={1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content invert ">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalToggleLabel2">
                  Add New Member
                </h1>
                <button
                  type="button"
                  className="btn-close "
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="">
                  <div className="">
                    <label htmlFor="floatingInputGroup1">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInputGroup1"
                      placeholder="Username"
                    />
                  </div>
                  <div className="my-3">
                    <label htmlFor="floatingInputGroup1">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      id="floatingInputGroup1"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walletscreen;
