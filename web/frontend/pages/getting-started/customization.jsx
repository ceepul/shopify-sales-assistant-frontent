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
        title="Customization Guide"
        breadcrumbs={breadcrumbs}
      />

      <div style ={{margin: '12px'}}>
        <Layout>
          <Layout.Section>
            <Text variant="headingXl">Customization Guide</Text>
            <Box minHeight="0.5rem"/>
            <Text>Dive deep into personalization to make your chatbot truly represent your brand. With just a few simple steps, you can tailor the chatbot to fit seamlessly into your website, enhancing user engagement and providing an enriched shopping experience.</Text>
          </Layout.Section>

          <Layout.AnnotatedSection
            title="Where to Find"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text variant="bodyLg">Navigate to the 'Customize' tab in your dashboard.</Text>
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
            title="Assistant Name"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text>Must be 18 characters or less.</Text>
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
            title="Accent Color"
            description={
              <div>
                <VerticalStack gap={'4'}>
                  <Text>Click the button to the right of the color field to open the visual color picker.</Text>
                  <Text>Alternatively enter a hex color code in the text field to set accent color.</Text>
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