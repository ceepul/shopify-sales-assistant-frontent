import {
  Layout,
  Page,
  Text,
  Box
} from "@shopify/polaris";
import { useNavigate, TitleBar } from "@shopify/app-bridge-react";

export default function GettingStartedPage() {
  const breadcrumbs = [
    { content: "ShopMate", url: "/" },
    { content: "Getting Started", url: "/getting-started"}
  ];

  return (
    <Page>
      <TitleBar
        title="Setup Guide"
        breadcrumbs={breadcrumbs}
      />

      <div style ={{margin: '12px'}}>
        <Layout>
          <Layout.Section>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px'}}>
              <Text>Setup Guide</Text>
            </div>
            <Box minHeight="1rem"/>
          </Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}