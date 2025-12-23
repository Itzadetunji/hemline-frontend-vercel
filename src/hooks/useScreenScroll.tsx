import { useCallback, useEffect, useState } from "preact/hooks";

export const useScreenScroll = () => {
  const [dimension, setDimension] = useState({
    width: window.scrollX,
    height: window.scrollY,
  });

  const updateDimension = useCallback(() => {
    setDimension({
      width: window.scrollX,
      height: window.scrollY,
    });
  }, []);

  useEffect(() => {
    updateDimension();
    window.addEventListener("scroll", updateDimension);

    return () => window.removeEventListener("scroll", updateDimension);
  }, [updateDimension]);

  return dimension;
};
