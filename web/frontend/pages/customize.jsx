import { TitleBar, Loading } from "@shopify/app-bridge-react"
import { 
  Page,
  Layout,
  SkeletonBodyText,
  AlphaCard,
  Text,
  Box,
  VerticalStack,
  SkeletonDisplayText
} from "@shopify/polaris"
import CustomizeUIForm from "../components/CustomizeUIForm";
import WidgetDynamicUI from "../components/WidgetDynamicUI";
import { useAppQuery } from '../hooks'
import { useEffect, useState } from "react";
 
export default function CustomizePage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const {
    data: queriedPreferences,
    isLoading,
    isRefetching,
    refetch
  } = useAppQuery({
    url: '/api/preferences',
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });

  const [preferences, setPreferences] = useState({
    assistantName: "ShopMate",
    accentColour: "#47AFFF",
    darkMode: false,
    homeScreen: true,
    welcomeMessage: "Welcome to our store! Are there any products I could help you find?",
  });

  useEffect(() => {
    if (queriedPreferences) {
      setPreferences(queriedPreferences);
    }
  }, [queriedPreferences]);

  function resetPreferences() {
    setPreferences(queriedPreferences);
  }

  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit QR code"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading/>
        <Layout>
          <Layout.Section>
            <VerticalStack gap="4">
              <Text variant="headingLg" as="h5">Settings</Text>
              <AlphaCard>
                <Text variant="headingMd" as="h6">Assistant Name</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
  
                <Box minHeight="2rem" />
  
                <Text variant="headingMd" as="h6">Accent Color</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
  
  {/*               <Box minHeight="2.5rem" />
  
                <Text variant="headingMd" as="h6">Dark Mode</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText /> */}
  
                <Box minHeight="2.5rem" />
  
                <Text variant="headingMd" as="h6">Home Screen</Text>
                <Box minHeight="0.5rem"/>
                <SkeletonBodyText />
              </AlphaCard>
            </VerticalStack>
          </Layout.Section>
          <Layout.Section secondary>
            <VerticalStack gap="4">
              <Text variant="headingLg" as="h5">Preview</Text>
              <AlphaCard>
                <SkeletonDisplayText />
                <Box minHeight="1rem"/>
                <SkeletonBodyText />
              </AlphaCard>
            </VerticalStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
        <TitleBar
          title="Customize"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Layout>
            <Layout.Section>
              <VerticalStack gap="4">
                <Text variant="headingLg" as="h5">Settings</Text>
                <CustomizeUIForm
                  preferences={preferences}
                  refetch={refetch}
                  resetPreferences={resetPreferences}
                  setPreferences={setPreferences}
                />
              </VerticalStack>
            </Layout.Section>
            <Layout.Section secondary>
              <VerticalStack gap="4">
                <Text variant="headingLg" as="h5">Preview</Text>
                <WidgetDynamicUI preferences={preferences}/>
              </VerticalStack>
            </Layout.Section>
        </Layout>
    </Page> 
  )
}