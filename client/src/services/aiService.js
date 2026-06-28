import api from "./api";

export const aiService = {
  suggest: (payload) => api.post("/ai/suggest", payload).then((res) => res.data)
};
