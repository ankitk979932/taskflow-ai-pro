import api from "./api";

export const analyticsService = {
  summary: () => api.get("/analytics/summary").then((res) => res.data)
};
