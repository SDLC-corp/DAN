import {axiosApi, privateAxios} from '../services/axios';
const baseUrl = import.meta.env.VITE_API_URL;

export async function apiGET(url, config = {}) {
  return await privateAxios
    .get(url, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}
export async function apiPOST(url, data, config = {}) {
  return privateAxios
    .post(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}

export async function apiPUT(url, data, config = {}) {
  return privateAxios
    .put(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}

export async function apiDELETE(url, config = {}) {
  return await privateAxios
    .delete(url, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}

export async function uploadPost(data) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // const accessToken = localStorage.getItem("accessToken")
  // myHeaders.append("Authorization", "Bearer " + accessToken);
  const raw = JSON.stringify(data);
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };
  try {
    const uploadUrl = `${baseUrl}/v1/upload-file`;
    const result = await fetch(uploadUrl, requestOptions);
    const response = await result.json();
    return response.data;
  } catch (err) {
    console.log('err errerr ', err.message);
  }
}

export const objectToQueryParam = (obj) => {
  if (typeof obj !== 'object') return '';
  let objKeys = Object.keys(obj);
  if (Object.keys(obj).length) {
    const queryParams = new URLSearchParams();
    objKeys.map((key) => {
      if (obj[key]) {
        queryParams.append(key, JSON.stringify(obj[key]));
      }
    });
    return decodeURIComponent(queryParams.toString());
  }
  return '';
};
