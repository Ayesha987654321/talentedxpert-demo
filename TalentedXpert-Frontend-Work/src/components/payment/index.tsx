"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { useRouter } from "next/navigation";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { getTimeago } from "@/services/utils/util";
import FilterCard from "../dashboardComponents/tasks/FilterCard";
import { Pagination } from "../common/Pagination/Pagination";
import DepositModal from "../common/Modals/DepositModal";
import { toast } from "react-toastify";
import ConnectNotVerified from "../common/Modals/ConnectNotVerified";

const Payment = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [transactions, setTransactions] = useState<any>([]);
  const [view, setView] = useState<"transactions" | "wallet">("transactions");
  const [balance, setBalance] = useState<any>({});
  const user = useSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [stripeDetail, setStripeDetail] = useState<boolean>(false);

  // pagination
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<string>("");

  // modal states
  // const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [wallet, setWallet] = useState<any>({});
  const getTransactions = async (params: any) => {
    await apiCall(
      `${requests.transactions}${params}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        if (res?.error) {
          return;
        } else {
          setTransactions(res?.data?.data || []);
        }
      })
      .catch((err) => console.warn(err));
  };

  const getConnectAccount = async () => {
    apiCall(
      `${requests?.connectStripeAccount}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res) => {
        if (res?.error?.message) return;
        setStripeDetail(
          res?.data?.data?.capabilities?.card_payments === "active"
        );
      })
      .catch((err) => console.warn(err));
  };

  const getWallet = async () => {
    await apiCall(
      `${requests.wallet}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        if (res?.error) {
          return;
        } else {
          setWallet(res?.data?.data);
        }
      })
      .catch((err) => console.warn(err));
  };

  const setFilterParams = () => {
    let filters = "";
    filters += "?page=" + page || "";
    filters += limit > 0 ? "&limit=" + limit : "";
    setFilters(filters);
  };

  useEffect(() => {
    setFilterParams();
  }, [limit, page]);

  const getBalance = async () => {
    await apiCall(requests.balance, {}, "get", false, dispatch, user, router)
      .then((res: any) => {
        if (res?.error) {
          return;
        } else {
          setBalance(res?.data?.data?.balance);
        }
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    getBalance();
    getConnectAccount();
  }, []);

  const handlePromotionResponse = async (promoted: any) => {
    setShowModal(false);
    getWallet();
    // toast.success("Profile Updated Successfully");
    // router.push("/dashboard");
  };

  useEffect(() => {
    getWallet();
    if (view === "transactions") {
      if (filters && filters !== "") {
        getTransactions(filters);
      }
    }
  }, [filters, view]);

  const onPageChange = (page: number) => {
    setPage(page);
    let filters = "";
    filters += page > 0 ? "?page=" + page : "";
    filters += limit > 0 ? "&limit=" + limit : "";
    setFilters(filters);
  };
  const handleclose = () => {
    setShowModal(false);
    getWallet();
  };

  const onLimitChange = (limit: number) => {
    setLimit(limit);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCall(
        requests.wallet + "/withdraw",
        { amount: Number(withdrawAmount) },
        "post",
        true,
        dispatch,
        user,
        router
      );
      console.log("resssss", response);
      if (response?.data?.success) {
        console.log("res", response);
        toast.success(response?.data?.data?.message);
        getWallet();
      } else {
        toast.error(response?.data?.data?.message);
        console.error("Payment error:", response.error);
      }
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      // setLoading(false);
    }
    // Handle withdraw API call
    console.log("Withdrawing:", { amount: withdrawAmount });
    // Reset and close modal
    setWithdrawAmount("");
    setShowWithdrawModal(false);
  };
  const formatedDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="card">
      <div className="walletscreen Top-card d-flex gap-2 pb-2">
        {/* <div className="card bg-dark text-white px-4 py-2">
          <h3>Pending Balance</h3>
          {balance?.pending?.length > 0 && (
            <span>$ {balance?.pending[0]?.amount / 100}</span>
          )}
        </div> */}
        {/* <div className="card bg-dark text-white px-4 py-2">
          <h3>Available Soon Balance</h3>
          {balance?.instant_available?.length > 0 && (
            <span>$ {balance?.instant_available[0]?.amount / 100}</span>
          )}
        </div> */}
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Stripe Balance</h3>
          {balance?.available?.length > 0 && (
            <span>$ {balance?.available[0]?.amount / 100}</span>
          )}
        </div>
        <div className="card bg-dark text-white px-4 py-2">
          <h3>Wallet Balance</h3>
          <div>
            <p className="fs-12 m-0 text-white">
              Available Balance: $ {Math.floor(wallet?.availableBalance)}
            </p>
            <p className="fs-12  m-0 text-white ">
              Escrow Balance: ${" "}
              {user?.profile[0]?.type === "TR"
                ? Math.floor(wallet?.escrowedBalance)
                : Math.floor(wallet?.teEscrowBalance)}
            </p>
          </div>
        </div>
      </div>

      <div className="tab-card first-card card-header">
        <div
          className="card-header bg-black px-2 text-light mx-0"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 className="mb-0">
            Wallet{" "}
            {wallet?.availableBalance
              ? "$ " + Math.floor(wallet.availableBalance)
              : ""}{" "}
          </h5>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* <button
              className="btn btn-primary"
            >
              Wallet {wallet?.availableBalance ? '$ ' + Math.floor(wallet.availableBalance) : ''}
            </button> */}
          </div>
        </div>

        <div className="tab-content" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
            tabIndex={0}
          >
            <ul style={{ display: "flex", gap: "10px" }} className="nav mb-3">
              <li className="nav-item">
                <button
                  className="nav-link"
                  style={{
                    transition: "all 0.5s ease",
                    backgroundColor: "black",
                    color: "white",
                    border: "1px solid #dee2e6",
                    margin: "5px 0px",
                    borderRadius: "10px",
                  }}
                  onClick={() => setShowModal(true)}
                >
                  Deposit
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  style={{
                    transition: "all 0.3s ease",
                    backgroundColor: "black",
                    color: "white",
                    border: "1px solid #dee2e6",
                    margin: "5px 0px",
                    borderRadius: "10px",
                  }}
                  data-bs-target={
                    !stripeDetail ? "#exampleModalToggle45" : undefined
                  }
                  data-bs-toggle={!stripeDetail ? "modal" : undefined}
                  onClick={() =>
                    stripeDetail ? setShowWithdrawModal(true) : ""
                  }
                >
                  Withdraw
                </button>
              </li>
            </ul>
            <div className="filtersearch d-flex align-items-center justify-content-between flex-wrap p-2">
              <div className="filters d-flex align-items-center">
                <select
                  className="form-select form-select-sm mx-1"
                  aria-label=".form-select-sm example"
                >
                  <option value={""}>Select</option>
                </select>
              </div>
            </div>
            <div className="Table table-responsive">
              <table className="table table-dark">
                <thead className="table-light">
                  <tr>
                    <th>SR</th>
                    <th>Paid by</th>
                    <th>Paid to</th>
                    <th>Details</th>
                    <th>Type</th>
                    {/* <th>Credit</th>
                        <th>Escrow</th>
                        <th>Balance</th> */}
                    {/* <th>Milestone Title</th> */}
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.transactions?.map(
                    (trans: any, index: number) => (
                      <tr className="table-dark" key={trans?.id}>
                        <td>{index + 1}</td>
                        <td scope="row">
                          {trans?.type == "DEPOSIT"
                            ? "CARD"
                            : trans?.senderProfile?.user?.firstName +
                              " " +
                              trans?.senderProfile?.user?.lastName}
                        </td>
                        <td>
                          {trans?.receiverProfile?.user?.firstName}{" "}
                          {trans?.receiverProfile?.user?.lastName}
                        </td>
                        <td>
                          {trans?.task?.name && `${trans?.task?.name}`}{" "}
                          {trans?.milestone?.details &&
                            `${trans?.milestone?.details}`}
                        </td>
                        <td>{trans?.type}</td>
                        {/* <td></td>
                          <td></td>
                          <td></td> */}
                        <td>{trans?.netAmount || trans?.amount}</td>

                        <td>{formatedDate(trans?.createdAt)}</td>
                        <td>{trans?.status}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {transactions && transactions?.count > 0 && (
              <Pagination
                count={transactions?.count}
                page={page}
                limit={limit}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
                siblingCount={1}
              />
            )}
          </div>
        </div>
      </div>

      <DepositModal
        show={showModal}
        handleClose={handleclose}
        handleResponse={handlePromotionResponse}
        title="Deposit in your Wallet"
      >
        <p>Please connect your account for 10$ per month</p>
      </DepositModal>
      {<ConnectNotVerified />}

      {/* Withdraw Modal */}
      <div
        className={`modal fade ${showWithdrawModal ? "show d-block" : ""}`}
        tabIndex={-1}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark">
            <div className="modal-header border-bottom border-secondary">
              <h5 className="modal-title text-light ">Withdraw Funds</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
              ></button>
            </div>
            <form onSubmit={handleWithdrawSubmit}>
              <div className="modal-body text-light">
                <div className="mb-3">
                  <label htmlFor="withdrawAmount" className="form-label">
                    Amount to Withdraw ($)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="withdrawAmount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount("");
                  }}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
