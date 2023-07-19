import { TitleBar, Loading } from "@shopify/app-bridge-react"
import { 
  Page,
  Layout,
  SkeletonBodyText,
  AlphaCard,
  Text,
  Box
} from "@shopify/polaris"
import PlaceholderStat from "../components/PlaceholderStat"
import Preview from "../components/Preview";
import CustomizeUIForm from "../components/CustomizeUIForm";
import { useAppQuery } from '../hooks'

export default function CustomizePage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const {
    data: preferences,
    isLoading,
    isRefetching,
    refetch
  } = useAppQuery({
    url: '/api/preferences',
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });

  console.log(preferences)

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
            <AlphaCard>
              <Text variant="headingMd" as="h6">Assistant Name</Text>
              <Box minHeight="0.5rem"/>
              <SkeletonBodyText />

              <Box minHeight="2rem" />

              <Text variant="headingMd" as="h6">Accent Color</Text>
              <Box minHeight="0.5rem"/>
              <SkeletonBodyText />

              <Box minHeight="2.5rem" />

              <Text variant="headingMd" as="h6">Dark Mode</Text>
              <Box minHeight="0.5rem"/>
              <SkeletonBodyText />

              <Box minHeight="2.5rem" />

              <Text variant="headingMd" as="h6">Home Screen</Text>
              <Box minHeight="0.5rem"/>
              <SkeletonBodyText />
            </AlphaCard>
          </Layout.Section>
          <Layout.Section secondary>
            <AlphaCard>
              <Text variant="headingMd" as="h6">Preview</Text>
              <Box minHeight="0.5rem"/>
              <SkeletonBodyText />
            </AlphaCard>
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
                <CustomizeUIForm preferences={preferences} refetch={refetch}/>
            </Layout.Section>
            <Layout.Section secondary>
                {/*Live preview of UI*/}
                <Preview />
            </Layout.Section>
        </Layout>
    </Page> 
  )
}