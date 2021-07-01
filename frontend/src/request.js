import { apiBase } from "./config";

const request = async (method, path, json, auth) => {
  const args = { method, credentials: "include" };
  const headers = {};
  if (json) {
    args.body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }
  if (auth !== null) headers.Authorization = `Bearer ${auth}`;
  args.headers = headers;
  const response = await fetch(`${apiBase}${path}`, args);
  if (!response.ok) throw new Error(`request failed with status ${response.status}`)
  return response.json();
};

const post = async (path, json = null, auth = null) => request("POST", path, json, auth);

const get = async (path, auth = null) => request("GET", path, null, auth);

const del = async (path, auth = null) => request("DELETE", path, null, auth);

export { post, get, del };
