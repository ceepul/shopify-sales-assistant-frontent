import { TitleBar, Loading, useAuthenticatedFetch, useNavigate } from "@shopify/app-bridge-react"
import { 
  AlphaCard,
  Layout,
  Page,
  Text,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
  Banner,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import PricingCard from "../../components/PricingCard";

export default function PlanSettingsPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const authFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [planDetails, setPlanDetails] = useState(null)
  const [currentPlanDetails, setCurrentPlanDetails] = useState(null)

  const [shop, setShop] = useState('')
  const [shopData, setShopData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [pageLoadError, setPageLoadError] = useState(false)

  const fetchPlanDetails = async () => {
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/plans`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setPageLoadError(true)
        return null;
      }

      setPageLoadError(false)
      const data = await response.json();
      return data;
    } catch (error) {
      setPageLoadError(true)
      return null;
    }
  }

  const fetchShop = async () => {
    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    return shop
  }

  const fetchShopData = async () => {
    try {
      const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/data?shop=${shop}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })  
      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to get current plan data", 
          body: "Please try again later." 
        })
        return null;
      }

      setError({ status: false, title: "", body: "" })
      const data = await response.json();
      return data;
    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to get current plan data", 
        body: "Please try again later." 
      })
      return null;
    }
  }

  useEffect(() => {
    setIsLoading(true);

    fetchShop()
      .then((shop) => {
        setShop(shop);
      })
      .catch((err) => {
        setError({ 
          status: true, 
          title: "Failed to get current plan data", 
          body: "Please try again later." 
        })
      });  

    fetchPlanDetails().then((data) => {
      setPlanDetails(data)
      setIsLoading(false);
    })
  }, []);

  useEffect(() => {
    if (shop) { // Only run if shop is not an empty string
      fetchShopData(shop).then(res => {
        setShopData(res);

        let plan = planDetails?.find(plan => plan.planId === shopData?.planId)
        if (!plan) {
          plan = planDetails?.find(plan => plan.planId === 4)
        }
        setCurrentPlanDetails(plan)

        if (res) {
          // Update so they are no longer a first time user
          const response = fetch("https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/shop/firsttimeuser", {
            method: "PATCH",
            body: JSON.stringify({ shop: shop, firstTimeUser: false }),
            headers: { "Content-Type": "application/json" },
          });
        }
      });
    }
  }, [shop]);

  const handleCancelSubscription = async () => {
    console.log("TODO: Handle Cancel Subscription")
  }

  const loadingMarkup = isLoading ? (
      <Layout>
        <Loading />
        <Layout.Section fullWidth>
          <SkeletonDisplayText />
          <Box minHeight="1rem"/>
          <AlphaCard>
            <SkeletonBodyText lines={4} />
          </AlphaCard>
        </Layout.Section>
      </Layout>
  ) : null

  const pageLoadErrorMarkup = !isLoading && pageLoadError ? (
    <AlphaCard>
      <div style={{margin: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="headingXl" as="h3">
            There was an error loading your plan settings
          </Text>
          <Text variant="bodyLg" as="p">
            Please try again later.
          </Text>
        </div>
      </div>
    </AlphaCard>
  ) : null

  const pageMarkup = !isLoading && !pageLoadError ? (
    <Layout>
      <Layout.Section primary>
        <div style={{paddingInline: '1rem'}}>
          <Text variant="headingXl" as="h3">Your Plan</Text>
          <Box minHeight="1rem"/>
          <AlphaCard>
            <Text variant="bodyLg" as="p">Plan Name:</Text>
            <Text>{currentPlanDetails?.planName}</Text>
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Plan Status:</Text>
            <Text>{shopData?.subscriptionStatus}</Text>
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Price:</Text>
            <Text>${currentPlanDetails?.monthlyPrice}</Text>
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Messages Included:</Text>
            <Text>{currentPlanDetails?.messagesPerMonth}</Text>
            <Box minHeight="1rem"/>
  
            {currentPlanDetails?.usagePrice && 
              <>
                <Text variant="bodyLg" as="p">Price after included messages:</Text>
                <Text>${currentPlanDetails.usagePrice} /message</Text>
              </>
            }
            <Box minHeight="1rem"/>
  
            <Text variant="bodyLg" as="p">Features: </Text>
            {currentPlanDetails?.features?.map((feature, index) => {
              return (
              <div key={index}>
                <Text>- {feature}</Text>
                <Box minHeight="0.5rem"/>
              </div>
              )
            })}
            <Box minHeight="1rem"/>
  
            <Box minHeight="2rem"/>
            <ButtonGroup>
              <Button onClick={handleCancelSubscription}>Cancel Subscription</Button>
              <Button primary onClick={() => navigate("/plan")}>Change Plan</Button>
            </ButtonGroup>
  
          </AlphaCard>
        </div>
      </Layout.Section>

      <Layout.Section secondary>
        <Box minHeight="2.75rem"/>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {currentPlanDetails && 
            <PricingCard 
              planId={currentPlanDetails.planId}
              active={true}
              title={currentPlanDetails.planName}
              price={currentPlanDetails.monthlyPrice}
              features={currentPlanDetails.features}
              handlePlanAction={null}
            />
          }
        </div>
      </Layout.Section>
    </Layout>
  ) : null

  return (
    <Page fullWidth>
      <TitleBar
        title="Edit QR code"
        breadcrumbs={breadcrumbs}
      />
      {/* Error banner */}
      {error.status === true && 
        <>
          <Banner 
            title={error.title} 
            onDismiss={() => {setError({status: false, title: "", body: ""})}}
            status="critical"
          >
              <p>{error.body}</p>
          </Banner>
          <Box minHeight="1rem" />
        </>
      }
      {loadingMarkup}
      {pageMarkup}
      {pageLoadErrorMarkup}
    </Page>
  )
}