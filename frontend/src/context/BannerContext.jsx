import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BannerContext = createContext();

export function BannerProvider({ children }) {
  const [banners, setBanners] = useState({});

  const refreshBanners = useCallback(() => {
    axios.get("/api/banners")
      .then(res => {
        const bannerMap = {};
        res.data.forEach(b => {
          bannerMap[b.name] = b.image_url;
        });
        setBanners(bannerMap);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshBanners();
  }, [refreshBanners]);

  return (
    <BannerContext.Provider value={{ banners, refreshBanners }}>
      {children}
    </BannerContext.Provider>
  );
}

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) return {};
  return context.banners;
};

export const useRefreshBanners = () => {
  const context = useContext(BannerContext);
  return context?.refreshBanners || (() => {});
};
