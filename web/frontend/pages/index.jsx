import { useNavigate, useAuthenticatedFetch, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  AlphaCard,
  Banner,
  Button,
  EmptyState,
  Layout,
  Page,
  Text,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import PlaceholderStat from "../components/PlaceholderStat";
import MessagesChart from "../components/MessagesChart";
import RecommendationEventsChart from "../components/RecommendationEventsChart";
import ProductStatsTable from "../components/ProductStatsTable";

export default function HomePage() {

    const navigate = useNavigate();
    const authFetch = useAuthenticatedFetch();

    const [productsConnected, setProductsConnected] = useState(true)
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

    const loadingMarkup = isLoading ? (
        <Layout>
        <Loading />
        <Layout.Section>
            <AlphaCard sectioned>
                <Loading />
                <SkeletonBodyText />
            </AlphaCard>
        </Layout.Section>
        </Layout>
      ) : null;

    const emptyStateMarkup =
    !isLoading && !productsConnected ? (
    <Layout>
    <Layout.Section>
        <AlphaCard sectioned>
            <EmptyState
            heading="Almost there!"
            /* This button will take the user to a Create a QR code page */
            action={{
                content: "Connect Products",
                onAction: () => navigate("/setup"),
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
            <p>
                Connect your store's products to start using the AI product recommender
            </p>
            </EmptyState>
        </AlphaCard>
    </Layout.Section>
    </Layout>
    ) : null;

    const connectedMarkup = !isLoading && productsConnected ? (
        <Layout>
            {/*Error banner */}
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


    /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
    */
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
          {emptyStateMarkup}
          {connectedMarkup}
        </Page>
    );
}