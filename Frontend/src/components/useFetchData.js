import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useFetchData = (url, dependencies = []) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, dependencies);

  return data;
};

export default useFetchData;
