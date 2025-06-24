export const BASE_URL = process.env.BASE_URL;
export const IMAGE_BASE_URL = process.env.BASE_URL + "/s3";
export const STRIPE_BASE_URL = process.env.BASE_URL + "/stripe";
export const DOMAIN = process.env.DOMAIN;
export const BASE_URL_AI = process.env.BASE_URL_AI;
// export const BASE_URL_AI = process.env.BASE_URL?.replace(":4000", "") + "/api1";
export const SOCKET_URL =
  "wss://" + process.env.BASE_URL?.replace("https://", "");

export const requests = {
  /* auth */
  login: BASE_URL + "/auth/login",
  userSessionLogout: BASE_URL + "/user-session/logout",
  signup: BASE_URL + "/users/createUser",

  /* get user */
  getUserInfo: BASE_URL + "/users/one/",
  getUserAll: BASE_URL + "/users/all",
  editUser: BASE_URL + "/users/",
  connectedAccount: BASE_URL + "/users/connected",

  /* tasks */
  getTasks: BASE_URL + "/tasks/all",
  addtask: BASE_URL + "/tasks/create",
  getTaskId: BASE_URL + "/tasks/one/",
  editTask: BASE_URL + "/tasks/",
  getTaskOnStatus: BASE_URL + "/tasks/all/user/",
  inviteTE: BASE_URL + "/tasks/invite",
  hourlyLog: BASE_URL + "/tasks/hourlylog",

  /* get category */
  getCategory: BASE_URL + "/categories",

  /* proposals */
  getProposals: BASE_URL + "/proposals/getProposal",
  addProposal: BASE_URL + "/proposals/add",
  updateProposal: BASE_URL + "/proposals/",

  /* messages and thread */
  getThread: BASE_URL + "/messages/threads",
  createThread: BASE_URL + "/messages/createThread",

  /* upload file or document */
  documentPreSigned: IMAGE_BASE_URL + "/presigned-url",
  documentPostSigned: IMAGE_BASE_URL + "/upload",
  getFile: IMAGE_BASE_URL + "/",
  downloadFile: IMAGE_BASE_URL + "/download",

  /*  make contract */
  makeContract: BASE_URL + "/contracts",
  getContract: BASE_URL + "/contracts",
  editContract: BASE_URL + "/contracts/",

  /* milestones */
  makeMilestone: BASE_URL + "/milestones",
  getMilestones: BASE_URL + "/milestones",
  getWeeklyMilestones: BASE_URL + "/milestones/weekly",
  milestoneFund: BASE_URL + '/milestones/fund',
  milestoneRelease: BASE_URL + '/milestones/release-payment',

  /* send or recieve msg */
  sendMsg: BASE_URL + "/messages/send",
  getMsg: BASE_URL + "/messages/getMessages",

  /* dispute */
  dispute: BASE_URL + "/dispute",
  editDispute: BASE_URL + "/dispute/",

  /* skills */
  getSkills: BASE_URL + "/skills",

  /* article */
  articles: BASE_URL + "/articles",
  createpayment: BASE_URL + "/promotion/create-payment",
  promotion: BASE_URL + "/promotion",

  /* reviews */
  reviews: BASE_URL + "/reviews",

  /* payments */
  connectStripeAccount: STRIPE_BASE_URL + `/connect-account`,
  paymentIntend: STRIPE_BASE_URL + `/payment-intent`,
  transactions: STRIPE_BASE_URL + "/transactions",
  balance: STRIPE_BASE_URL + "/balance",
  // confirmPayment: STRIPE_BASE_URL + `/confirm-intent`,

  /* generate bio */
  createBio: BASE_URL_AI + `/api1/generate_bio`,
  createProposalDescription: BASE_URL_AI + `/api1/generate_proposal`,
  createTaskDescription: BASE_URL_AI + "/api1/generate_jd",
  topProposal: BASE_URL_AI + "/api1/generate_top_proposal",
  createContractDescription: BASE_URL_AI + '/api1/generate_contract\n',
  createArticleDescription: BASE_URL_AI + '/api1/generate_articals',
  cvParser: BASE_URL_AI + "/api2/cv_parser",

  /* countries */
  countries: BASE_URL + `/location/countries`,
  states: BASE_URL + "/location/states",
  cities: BASE_URL + "/location/cities",

  //notification
  notifications: BASE_URL + "/notifications",

  /* teams */
  teams: BASE_URL + "/teams",
  inviteMember: BASE_URL + "/teams/invite",
  invitation: BASE_URL + "/teams/invitation",

  /* wallet */
  wallet: BASE_URL + "/wallet",
  createDeposit: BASE_URL + "/wallet/create-deposit",
  confirmDeposit: BASE_URL + "/wallet/confirm-deposit",
  spendings: BASE_URL + '/wallet/total-spent',
  earnings: BASE_URL + '/wallet/total-earned'
};
