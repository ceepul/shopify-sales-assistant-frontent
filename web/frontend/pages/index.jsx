import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  AlphaCard,
  Banner,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useState } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import PlaceholderStat from "../components/PlaceholderStat";

export default function HomePage() {

    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();

    const [productsConnected, setProductsConnected] = useState(true)
    const isLoading = false;

    const handleConnectProducts = async () => {
        const response = await fetch("/api/upload-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const readable = await response.json()

        console.log(readable)
    }

    const loadingMarkup = isLoading ? (
        <Layout>
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
            {/*Any banner notification would go here*/}
            <Layout.Section fullWidth>
            <Banner title="Notification" onDismiss={() => {}}>
                <p>For help with setting up the chatbot visit the Getting Started Page</p>
            </Banner>
            </Layout.Section>

            {/*Two column stats section*/}
            <Layout.Section oneHalf>
                <PlaceholderStat />
            </Layout.Section>
            <Layout.Section oneHalf>
                <PlaceholderStat />
            </Layout.Section>

            {/*Full width stats section*/}
            <Layout.Section>
                <PlaceholderStat />
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
            content: "Setup Assistant",
            onAction: () => navigate("/setup"),
            }}
        />
        {loadingMarkup}
        {emptyStateMarkup}
        {connectedMarkup}
        </Page>
    );
}