export const formatDate = (date) => {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
};

export const toDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

export const getErrorMessage = (error) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length) return errors.map((item) => item.msg).join(", ");
  return error?.response?.data?.message || error?.message || "Something went wrong";
};
