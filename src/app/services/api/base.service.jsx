import 'constant/app';
const get = async (path, query = {}, headers = {}) => {
  const requestOptions = {
    method: 'GET',
    headers: new Headers({
      'Accept': 'application/json',
      'Accept-Version': 'latest',
      'Content-Type': 'application/json',
      ...headers,
    }),
  };
  const url = new URL(path + new URLSearchParams(query), globalThis.envault.origin);
  const response = await fetch(url.toString(), requestOptions);
  return handleResponse(response);
};

const post = async (path, query = {}, body, headers = {}) => {
  const requestOptions = {
    method: 'POST',
    headers: new Headers({
      'Accept-Version': 'latest',
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: JSON.stringify(body),
  };
  const url = new URL(path + new URLSearchParams(query), globalThis.envault.origin);
  const response = await fetch(url.toString(), requestOptions);
  return handleResponse(response);
};

const patch = async (path, query = {}, body, headers = {}) => {
  const requestOptions = {
    method: 'PATCH',
    headers: new Headers({
      'Accept-Version': 'latest',
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: JSON.stringify(body),
  };
  const url = new URL(path + new URLSearchParams(query), globalThis.envault.origin);
  const response = await fetch(url.toString(), requestOptions);
  return handleResponse(response);
};

const put = async (path, query = {}, body, headers = {}) => {
  const requestOptions = {
    method: 'PUT',
    headers: new Headers({
      'Accept-Version': 'latest',
      'Content-Type': 'application/json',
      ...headers,
    }),
    body: JSON.stringify(body),
  };
  const url = new URL(path + new URLSearchParams(query), globalThis.envault.origin);
  const response = await fetch(url.toString(), requestOptions);
  return handleResponse(response);
};

const remove = async (path, query = {}, headers = {}) => {
  const requestOptions = {
    method: 'DELETE',
    headers: new Headers({
      'Accept-Version': 'latest',
      'Content-Type': 'application/json',
      ...headers,
    }),
  };
  const url = new URL(path + new URLSearchParams(query), globalThis.envault.origin);
  const response = await fetch(url.toString(), requestOptions);
  return handleResponse(response);
};

// helper functions
const handleResponse = async response => {
  const responseClone = response.clone();
  const contentType = responseClone.headers.get('content-type');
  // parse response body
  if (contentType.includes('json')) {
    response.data = await responseClone.json();
  } else {
    response.data = await responseClone.text();
  }
  // check for error response, use entire response object for error
  if (response.ok) {
    return response.data;
  } else {
    return Promise.reject(response);
  }
};

export const BaseService = {
  get,
  post,
  patch,
  put,
  remove,
};
