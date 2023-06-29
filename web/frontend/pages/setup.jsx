import { Layout, Page, Text, VerticalStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import PlaceholderStat from "../components/PlaceholderStat";
import ConnectProductsCard from "../components/ConnectProductsCard";
import SetupForm from "../components/SetupForm";
import Preview from "../components/Preview";

export default function SetupPage() {
    const breadcrumbs = [{ content: "ShopMate", url: "/" }];
    const productsConnected = false;

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
                        <ConnectProductsCard productsConnected={productsConnected}/>
                    }
                    <SetupForm />
                    {productsConnected && 
                        <ConnectProductsCard productsConnected={productsConnected}/>
                    }
                </VerticalStack>
            </Layout.Section>
            <Layout.Section secondary>
                {/*Live preview of assistant*/}
                <Preview />
            </Layout.Section>
        </Layout>
    </Page>
    );
}