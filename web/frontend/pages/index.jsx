import { useNavigate, useAuthenticatedFetch, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  AlphaCard,
  Banner,
  Icon,
  Layout,
  Page,
  SkeletonBodyText,
  Text
} from "@shopify/polaris";
import {
  ChatMajor,
  CalendarMajor
} from '@shopify/polaris-icons';
import { useState, useEffect } from "react";
import PlaceholderStat from "../components/PlaceholderStat";
import MessagesChart from "../components/MessagesChart";
import RecommendationEventsChart from "../components/RecommendationEventsChart";
import ProductStatsTable from "../components/ProductStatsTable";
import GettingStartedPrompt from "../components/GettingStartedPrompt";
import SubscriptionStatusBanner from "../components/SubscriptionStatusBanner";
import StatCardSmall from "../components/StatCardSmall";
import PlaceholderStatSmall from "../components/PlaceHolderStatSmall";
import ProductViewsCardSmall from "../components/ProductViewsCardSmall";

export default function HomePage() {
    const navigate = useNavigate();
    const authFetch = useAuthenticatedFetch();

    const [shopData, setShopData] = useState(null);
    const [currentPlanDetails, setCurrentPlanDetails] = useState(null);

    const [shop, setShop] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState({
      status: false,
      title: "",
      body: "",
    });
    const [isSubscriptionStatusBannerVisible, setIsSubscriptionStatusBannerVisible] = useState(true);

    const handleSubscriptionStatusBannerDismiss = () => {
      setIsSubscriptionStatusBannerVisible(false);
      sessionStorage.setItem('bannerDismissed', 'true');
    };

    const fetchShop = async () => {
      const shop = await authFetch("/api/shop", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((response) => response.text());

      return shop
    }

    const fetchShopData = async () => {
      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/data?shop=${shop}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })  
        if (!response.ok) {
          setError({ 
            status: true, 
            title: "Failed to get shop data", 
            body: "Please try again later." 
          })
          return null;
        }
  
        setError({ status: false, title: "", body: "" })
        const data = await response.json();
        return data;
      } catch (error) {
        setError({ 
          status: true, 
          title: "Failed to get shop data", 
          body: "Please try again later." 
        })
        return null;
      }
    }

    const fetchCurrentPlanDetails = async () => {
      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/current-plan?shop=${shop}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })  
        if (!response.ok) {
          setError({ 
            status: true, 
            title: "Failed to get shop data", 
            body: "Please try again later." 
          })
          return null;
        }
  
        setError({ status: false, title: "", body: "" })
        const data = await response.json();
        return data;
      } catch (error) {
        setError({ 
          status: true, 
          title: "Failed to get shop data", 
          body: "Please try again later." 
        })
        return null;
      }
    }

    useEffect(() => {
      setIsLoading(true);
      if (sessionStorage.getItem('bannerDismissed')) {
        setIsSubscriptionStatusBannerVisible(false);
      }
      fetchShop()
        .then((shop) => {
          setShop(shop);
          setIsLoading(false);
        })
        .catch((err) => {
          setError({
            status: true, 
            title: "Could not fetch shop",
            body: "We are having trouble loading your store's information. Please try again later."
          })
          setIsLoading(false);
        });  
    }, []);

    useEffect(() => {
      if (shop) { // Only run if shop is not an empty string
        fetchShopData(shop).then(data => {
          setShopData(data);
          if (data.firstTimeUser) {
            // Update so they are no longer a first time user
            const response = fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/firsttimeuser", {
              method: "PATCH",
              body: JSON.stringify({ shop: shop, firstTimeUser: false }),
              headers: { "Content-Type": "application/json" },
            });
          }
        });
        fetchCurrentPlanDetails(shop).then(data => {
          setCurrentPlanDetails(data)
        });
      }
    }, [shop]);

    function formatDateToMonthDay(dateString) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const parts = dateString?.split('-');
      const date = new Date(parts[0], parts[1] - 1, parts[2]);  // Subtracting 1 from month since months are 0-indexed in JS Date
      
      const month = months[date.getMonth()];
      const day = String(date.getDate()).padStart(2, '0');  // This ensures the day is always two digits
  
      return `${month} ${day}`;
    }

    const loadingMarkup = isLoading ? (
        <Layout>
          <Loading />
          <Layout.Section oneThird>
            <PlaceholderStatSmall />
          </Layout.Section>
          <Layout.Section oneThird>
            <PlaceholderStatSmall />
          </Layout.Section>
          <Layout.Section oneThird>
            <PlaceholderStatSmall />
          </Layout.Section>

          <Layout.Section oneHalf>
              <PlaceholderStat />
          </Layout.Section>
          <Layout.Section oneHalf>
              <PlaceholderStat />
          </Layout.Section>
          <Layout.Section>
              <AlphaCard sectioned>
                  <Loading />
                  <SkeletonBodyText lines={4}/>
              </AlphaCard>
          </Layout.Section>
        </Layout>
      ) : null;

    const connectedMarkup = !isLoading ? (
        <Layout>
            {/* Error banner */}
            {error.status === true && 
              <Layout.Section fullWidth>
                <Banner 
                  title={error.title} 
                  onDismiss={() => {setError({status: false, title: "", body: ""})}}
                  status="critical"
                >
                    <p>{error.body}</p>
                </Banner>
              </Layout.Section>
            }

            {isSubscriptionStatusBannerVisible && <Layout.Section fullWidth>
              {shopData && 
              <SubscriptionStatusBanner 
                  onDismiss={handleSubscriptionStatusBannerDismiss}
                  firstInstallDate={shopData.firstInstallDate}
                  subscriptionId={shopData.planId}
                  subscriptionStatus={shopData.subscriptionStatus}
                  subscriptionStartDate={shopData.subscriptionStartDate}
                  subscriptionEndDate={shopData.subscriptionEndDate}
                  allowedMessages={currentPlanDetails?.messagesPerMonth}
                  messagesThisBillingPeriod={shopData.messagesThisBillingPeriod}
              />}
            </Layout.Section>}

            <Layout.Section oneThird>
              <StatCardSmall 
                loading={isLoading}
                heading={'Messages'}
                headingData={shopData && currentPlanDetails &&
                  <div style={{display: 'flex', alignItems: 'baseline', gap: '0.25rem'}}>
                    <Text variant="heading2xl">{shopData?.messagesThisBillingPeriod}</Text>
                    <Text variant="bodyMd">{currentPlanDetails?.messagesPerMonth && `/${currentPlanDetails.messagesPerMonth}`}</Text>
                  </div>
                }
                subHeading={'This usage cycle'}
                badgeStatus={
                  !currentPlanDetails ? 'info' : (
                  shopData?.messagesThisBillingPeriod / currentPlanDetails?.messagesPerMonth < 0.8 ? 'info' : 
                  shopData?.messagesThisBillingPeriod / currentPlanDetails?.messagesPerMonth < 1 ? 'warning' : 'critical')
                }
                badgeData={currentPlanDetails && 
                  `${shopData?.messagesThisBillingPeriod / currentPlanDetails?.messagesPerMonth * 100}%`
                }
              />
            </Layout.Section>

            <Layout.Section oneThird>
              <ProductViewsCardSmall shop={shop} subscriptionStartDate={shopData?.subscriptionStartDate}/>
            </Layout.Section>

            <Layout.Section oneThird>
              <StatCardSmall 
                loading={isLoading}
                heading={'Current Period'}
                headingData={shopData &&
                    <Text variant="headingXl">
                      {`${formatDateToMonthDay(shopData?.subscriptionStartDate)} - ${formatDateToMonthDay(shopData?.subscriptionEndDate)}`}
                    </Text>}
                subHeading = {shopData &&
                  `${Math.ceil((new Date(shopData?.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining in this usage cycle`
                }
              />
            </Layout.Section>

            {/*Two column stats section*/}
            <Layout.Section oneHalf>
                <MessagesChart shop={shop} />
            </Layout.Section>
            <Layout.Section oneHalf>
                <RecommendationEventsChart shop={shop} />
            </Layout.Section>

            {/*Full width stats section*/}
            <Layout.Section>
                <ProductStatsTable shop={shop} />
            </Layout.Section>
        </Layout>
    ) : null;

    return (
        <Page>
          <TitleBar
              title="ShopMate"
              primaryAction={{
              content: "Customize Assistant",
              onAction: () => navigate("/customize"),
              }}
          />
            {loadingMarkup}
            {connectedMarkup}
            <GettingStartedPrompt 
              isActive={shopData?.firstTimeUser ?? false} 
              onClose={() => setShopData(prev => ({
                ...prev,
                firstTimeUser: false
              }))}
              shop={shop}
            />
        </Page>
    );
}