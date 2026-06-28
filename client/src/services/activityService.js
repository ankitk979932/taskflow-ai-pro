import api from "./api";

export const activityService = {
  list: (params = {}) => api.get("/activity", { params }).then((res) => res.data)
};
