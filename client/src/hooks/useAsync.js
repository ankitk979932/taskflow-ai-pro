import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../utils/formatters";

export const useAsync = (fn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, setData, loading, error, refresh: run };
};
