import axios from "axios";
import { clearToken, setAuthState } from "../../reducers/AuthSlice";
import { setUser } from "../../reducers/UserSlice";
import { setIsAccessed } from "../../reducers/AccessSlice";
import { BASE_URL, requests } from "../requests/requests";
import { toast } from "react-toastify";
import { setThread } from "@/reducers/ThreadSlice";

export const DOMAIN = process.env.DOMAIN;

const notify = () => {
  toast.success("Success Notification !", {
    // position: toast.POSITION.TOP_RIGHT,
    position: 'top-right'
  });

}


const apiCall = async (
  url: string,
  params: any,
  method: string,
  displayMessage: boolean,
  dispatch: any | null,
  user: any | null,
  router: any | null,
  skipAuth: boolean = false
): Promise<any> => {
  const data: { [x: string]: any } = {};

  let token;
  let profileType;

  if (typeof window !== 'undefined') {
    token = localStorage?.getItem("accessToken");
    profileType = localStorage?.getItem("profileType");
  }

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      ...(token && !skipAuth &&{ Authorization: `Bearer ` + token }),
      ...(profileType && {profileType: profileType})
    },
    data: params,
  });
 
  if (method === "post") {
    await client.post(url, params).then((res) => {
      data.data = res.data;
    }).catch((error) => {        
        if (error.response) {
          data.error = { message: error.response.data.message || error.response.data.detail };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "patch") {
    await client
      .patch(url, params)
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "put") {
    await client
      .put(url, params)
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "get") {
    // displayMessage && notify();
    await client
      .get(url, {
        params: {
          ...(Object.keys(params).length && { ...params }),
        },
      })
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        } else {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        }
      });
  } else if (method === "delete") {
    displayMessage && notify();
    await client
      .delete(url, {
        params: {
          ...(Object.keys(params).length && { ...params }),
        },
      })
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        } else {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        }
      });
  }

  async function logout() {
    const redirect_url = `${DOMAIN}/`;
    localStorage.clear();
    dispatch(clearToken());
    dispatch(setUser(null));
    dispatch(setAuthState(false));
    dispatch(setIsAccessed(false))
    dispatch(setThread(null));
    router && router.push('/');
  }

  return data;
};

/**
 *
 * @param url
 * @param params
 * @param method
 * @param token
 * @returns
 */

export const apiRequestWithToken = async (
  url: string,
  params: any,
  method: string,
  token: any,
  dispatch: any | null,
  user: any | null,
  router: any | null
): Promise<any> => {
  const data: { [x: string]: any } = {};

  const client = axios.create({
    baseURL: "",
    headers: {
      ...(token && { Authorization: `Bearer ` + token }),
    },
    data: params,
  });

  if (method === "post") {
    await client
      .post(url, params)
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "patch") {
    await client
      .patch(url, params)
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "put") {
    await client
      .put(url, params)
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = { message: error.message };
        } else {
          data.error = { message: error.message };
        }
      });
  } else if (method === "get") {
    await client
      .get(url, {
        params: {
          ...(Object.keys(params).length && { ...params }),
        },
      })
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        } else {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        }
      });
  } else if (method === "delete") {
    await client
      .delete(url, {
        params: {
          ...(Object.keys(params).length && { ...params }),
        },
      })
      .then((res) => {
        data.data = res.data;
      })
      .catch((error) => {
        if (error.response) {
          data.error = { message: error.response.data.message };
          error.response.status === 401 && logout();
        } else if (error.request) {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        } else {
          data.error = {
            message:
              "Please check your internet connection or consult technical team",
          }; //error.message
        }
      });
  }

  async function logout() {
    const redirect_url = `${DOMAIN}/`;
    await deleteUserSession()
    localStorage.clear();
    dispatch(clearToken());
    dispatch(setUser(null));
    dispatch(setAuthState(false));
    dispatch(setIsAccessed(false))
    dispatch(setThread(null));
    router && router.push('/');
  }

  return data;
};

export const deleteUserSession = async () => {
    const token = localStorage.getItem('accessToken');

    await axios.delete(`${requests.userSessionLogout}`, {
        headers: {
          Authorization: `Bearer ` + token 
        },
        data: {
        }
      });
};

export default apiCall;

