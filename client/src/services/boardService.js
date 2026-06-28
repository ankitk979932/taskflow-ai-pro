import api from "./api";

export const boardService = {
  list: () => api.get("/boards").then((res) => res.data),
  get: (id) => api.get(`/boards/${id}`).then((res) => res.data),
  create: (payload) => api.post("/boards", payload).then((res) => res.data),
  update: (id, payload) => api.put(`/boards/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/boards/${id}`).then((res) => res.data)
};
