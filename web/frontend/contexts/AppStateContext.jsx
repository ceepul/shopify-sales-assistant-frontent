import { createContext, useState, useContext, useCallback } from "react";

const AppStateContext = createContext();

export const useAppState = () => {
  return useContext(AppStateContext);
};

export const AppStateProvider = ({ children }) => {
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true);
  const [currentPlanDetails, setCurrentPlanDetails] = useState({});
  const [allPlanDetails] = useState([]);
  const [shopData, setShopData] = useState({});
  const [shopPreferences, setShopPreferences] = useState({});

  // Mocked API calls, replace with actual API fetching
  const fetchCurrentPlanDetails = useCallback(async () => {
    const data = {
      // replace with actual fetching logic
      name: "Sample Plan",
      price: 50,
      messagesPerMonth: 500,
      faqAllowed: 20,
    };
    setCurrentPlanDetails(data);
  }, []);

  const fetchShopData = useCallback(async () => {
    const data = {
      // replace with actual fetching logic
      // ...
    };
    setShopData(data);
  }, []);

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
        fetchCurrentPlanDetails,
        fetchShopData,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
