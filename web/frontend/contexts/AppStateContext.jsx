import { createContext, useState, useContext, useCallback, useEffect } from "react";
import { useAuthenticatedFetch } from '../hooks'

const AppStateContext = createContext();

export const useAppState = () => {
  return useContext(AppStateContext);
};

export const AppStateProvider = ({ children }) => {
  const authFetch = useAuthenticatedFetch()
  const [shop, setShop] = useState('');
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true);
  const [currentPlanDetails, setCurrentPlanDetails] = useState({});
  const [allPlanDetails] = useState([]);
  const [shopData, setShopData] = useState({});
  const [shopPreferences, setShopPreferences] = useState({});

  const fetchShop = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    console.log(`Fetched Shop: ${shop}`)
    setShop(shop);
  }

  const fetchShopPreferences = async() => {
    if (shop) {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/preferences?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return;
    
      const data = await response.json();
      setShopPreferences(data);
    }
  }

  useEffect(() => {
    fetchShop();
  }, [])

  useEffect(() => {
    if (shop) {
      fetchShopPreferences();
    }
  }, [shop])

  return (
    <AppStateContext.Provider
      value={{
        showSubscriptionBanner,
        setShowSubscriptionBanner,
        currentPlanDetails,
        allPlanDetails,
        shopData,
        shopPreferences,
        setShopPreferences,
        fetchShopPreferences,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
