import {
  Layout,
  Page,
  Text,
  Box,
  VerticalStack,
  AlphaCard,
  List,
  Button,
  Icon
} from "@shopify/polaris";
import {
  AppExtensionMinor,
} from '@shopify/polaris-icons';
import { useNavigate, TitleBar } from "@shopify/app-bridge-react";

export default function GettingStartedPage() {
  const breadcrumbs = [
    { content: "ShopMate", url: "/" },
    { content: "Getting Started", url: "/getting-started"}
  ];

  return (
    <Page>
      <TitleBar
        title="Installation"
        breadcrumbs={breadcrumbs}
      />

      <div style ={{margin: '12px'}}>
        <Layout>
          <Layout.Section>
            <Text variant="headingXl">Installation Guide</Text>
            <Box minHeight="0.5rem"/>
            <Text>How to install the AI Assistant on your storefront</Text>
          </Layout.Section>

          <Layout.AnnotatedSection
            title="Step 1"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text variant="bodyLg">Navigate to the app embeds page:</Text>
                  <List type="number">
                    <List.Item>Login to the Shopify Admin.</List.Item>
                    <List.Item>Go to 'Online Store'.</List.Item>
                    <List.Item>Customize your theme and select the 'App Embeds tab'.</List.Item>
                  </List>
                  <div>
                    <Button primary>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        <Icon source={AppExtensionMinor}/>
                        <Text>Open App Embed</Text>
                      </div>
                    </Button>
                  </div>
                </VerticalStack>
              </div>
            }
          >
            <AlphaCard>
              <div style={{ maxWidth: '50%' }}>
                <img src="https://shopify-recommendation-app.s3.amazonaws.com/assets/placeholder-square.jpg" style={{ width: '100%', height: 'auto' }}/>
              </div>
            </AlphaCard>
          </Layout.AnnotatedSection>

          <Layout.AnnotatedSection
            title="Step 2"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text variant="bodyLg">Enable the AI Assistant</Text>
                  <Text>Find the Shopping Assistant in the list and toggle it on for instant AI magic on your store.</Text>
                </VerticalStack>
              </div>
            }
          >
            <AlphaCard>
              <div style={{ maxWidth: '50%' }}>
                <img src="https://shopify-recommendation-app.s3.amazonaws.com/assets/placeholder-square.jpg" style={{ width: '100%', height: 'auto' }}/>
              </div>
            </AlphaCard>
          </Layout.AnnotatedSection>

          <Layout.AnnotatedSection
            title="Step 3"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text variant="bodyLg">Personalize Settings to Fit Your Store</Text>
                  <Text>Use the drop-down menu to tweak settings, ensuring the AI widget aligns perfectly with your brand.</Text>
                </VerticalStack>
              </div>
            }
          >
            <AlphaCard>
              <div style={{ maxWidth: '50%' }}>
                <img src="https://shopify-recommendation-app.s3.amazonaws.com/assets/placeholder-square.jpg" style={{ width: '100%', height: 'auto' }}/>
              </div>
            </AlphaCard>
          </Layout.AnnotatedSection>
        </Layout>
      </div>
    </Page>
  );
}