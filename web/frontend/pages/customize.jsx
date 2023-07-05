import { TitleBar } from "@shopify/app-bridge-react"
import { 
  Page,
  Layout,
} from "@shopify/polaris"
import PlaceholderStat from "../components/PlaceholderStat"
import Preview from "../components/Preview";
import CustomizeUIForm from "../components/CustomizeUIForm";

export default function CustomizePage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  return (
    <Page>
        <TitleBar
        title="Customize"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
        />
        <Layout>
            <Layout.Section>
                <CustomizeUIForm />
            </Layout.Section>
            <Layout.Section secondary>
                {/*Live preview of UI*/}
                <Preview />
            </Layout.Section>
        </Layout>
    </Page> 
  )
}