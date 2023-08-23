import { useNavigate, useAuthenticatedFetch, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  AlphaCard,
  Banner,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import PlaceholderStat from "../components/PlaceholderStat";
import MessagesChart from "../components/MessagesChart";
import RecommendationEventsChart from "../components/RecommendationEventsChart";
import ProductStatsTable from "../components/ProductStatsTable";
import GettingStartedPrompt from "../components/GettingStartedPrompt";

export default function HomePage() {
    const navigate = useNavigate();
    const authFetch = useAuthenticatedFetch();

    const [firstTimeUser, setFirstTimeUser] = useState(false)

    const [shop, setShop] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState({
      status: false,
      title: "",
      body: "",
    });

    const fetchShop = async () => {
      const shop = await authFetch("/api/shop", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((response) => response.text());

      return shop
    }

    const fetchFirstTimeUser = async () => {
      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/firsttimeuser?shop=${shop}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })  
        if (!response.ok) {
          // No need to log error here
          return false;
        }
  
        const data = await response.json();
        return data.firstTimeUser;
      } catch (error) {
        return false;
      }
    }

    useEffect(() => {
      setIsLoading(true);
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
        fetchFirstTimeUser(shop).then(res => {
          setFirstTimeUser(res);
          if (res) {
            // Update so they are no longer a first time user
            const response = fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/firsttimeuser", {
              method: "PATCH",
              body: JSON.stringify({ shop: shop, firstTimeUser: false }),
              headers: { "Content-Type": "application/json" },
            });
          }
        });
      }
    }, [shop]);

    const loadingMarkup = isLoading ? (
        <Layout>
          <Loading />
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

            {/*Any banner notification would go here*/}
            <Layout.Section fullWidth>
              <Banner title="Notification" onDismiss={() => {}}>
                  <p>For help with setting up the chatbot visit the Getting Started Page</p>
              </Banner>
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
              secondaryActions={[{
                content: "Change Plan",
                onAction: () => navigate("/plan")
              }]}
          />
            {loadingMarkup}
            {connectedMarkup}
            <GettingStartedPrompt 
              isActive={firstTimeUser} 
              onClose={() => setFirstTimeUser(false)}
              shop={shop}
            />
        </Page>
    );
}