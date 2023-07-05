import {
  Layout, 
  Page,
  Text, 
  VerticalStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import PlaceholderStat from "../components/PlaceholderStat";
import ConnectProductsCard from "../components/ConnectProductsCard";
import SetupForm from "../components/SetupForm";
import Preview from "../components/Preview";
import { useState } from "react";

export default function SetupPage() {
    const breadcrumbs = [{ content: "ShopMate", url: "/" }];
    const [productsConnected, setProductsConnected] = useState(false);

    const handleConnectedStatus = () => {
      setProductsConnected((productsConnected) => (!productsConnected))
    }

    return (
    <Page>
        <TitleBar
        title="Setup"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
        />
        <Layout>
            <Layout.Section>
                {/*Settings*/}
                <VerticalStack gap="4">
                    <Text variant="headingLg" as="h5">Settings</Text>
                    {!productsConnected && 
                        <ConnectProductsCard 
                          productsConnected={productsConnected}
                          handleConnectedStatus={handleConnectedStatus}
                        />
                    }
                    <SetupForm />
                    {productsConnected && 
                        <ConnectProductsCard 
                          productsConnected={productsConnected}
                          handleConnectedStatus={handleConnectedStatus}
                        />
                    }
                </VerticalStack>
            </Layout.Section>
            <Layout.Section secondary>
                {/*Live preview of assistant*/}
                <VerticalStack gap="4">
                  <Text variant="headingLg" as="h5">
                    Preview
                  </Text>
                  <Preview />
                </VerticalStack>
            </Layout.Section>
        </Layout>
    </Page>
    );
}