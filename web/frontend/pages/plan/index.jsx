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
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import PricingCard from '../../components/PricingCard'

export default function PlanPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const authFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [planDetails, setPlanDetails] = useState(null)
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
          title: "Failed to get subscription data", 
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
        title: "Failed to get subscription data", 
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
          title: "Failed to get subscription data", 
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

  const handleSubscribe = async ({ planId, planName, planPrice }) => {
    const trialDays = 4 //Calculate trial days based on firstInstallDate
    const relativeUrl = '/'

    try {
      const response = await authFetch("/api/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({ planName, planPrice, trialDays, relativeUrl }),
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        setError({ 
          status: true, 
          title: "Failed to create subscription", 
          body: "Please try again later." 
        })
        return
      }

      setError({ status: false, title: "", body: "" })
      const data = await response.json()
      
      navigate(data.confirmationUrl)

    } catch (error) {
      setError({ 
        status: true, 
        title: "Failed to create subscription", 
        body: "Please try again later." 
      })
    }
  }

  const loadingMarkup = isLoading ? (
      <Layout>
        <Loading />
        <Layout.Section fullWidth>
          <AlphaCard>
            <SkeletonBodyText lines={3} />
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
        <Layout.Section oneThird>
          <AlphaCard>
            <SkeletonDisplayText />
            <Box minHeight="4rem"/>
            <SkeletonBodyText lines={3} />
            <Box minHeight="10rem"/>
          </AlphaCard>
        </Layout.Section>
      </Layout>
  ) : null

  const pageMarkup = !isLoading && !pageLoadError ? (
    <AlphaCard>
      <div style={{marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="heading2xl" as="h3">
            Find the right plan for your business
          </Text>
          <Text variant="bodyLg" as="p">
            Start with a 14-day free trial. Cancel at anytime.
          </Text>
        </div>
        <Layout>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                planId={planDetails[1].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[1].planId} // Active plan and plan id matches.
                planName={planDetails[1].planName}
                planPrice={planDetails[1].monthlyPrice}
                features={planDetails[1].features}
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                planId={planDetails[2].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[2].planId}
                planName={planDetails[2].planName}
                planPrice={planDetails[2].monthlyPrice}
                features={planDetails[2].features}
                primary
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>
          <Layout.Section oneThird>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <PricingCard 
                planId={planDetails[3].planId}
                active={shopData?.subscriptionStatus === 'ACTIVE' && shopData?.planId === planDetails[3].planId}
                planName={planDetails[3].planName}
                planPrice={planDetails[3].monthlyPrice}
                features={planDetails[3].features}
                handleSubscribe={(props) => handleSubscribe(props)}
              />
            </div>
          </Layout.Section>
        </Layout>
      </div>
    </AlphaCard>
  ) : null

  const pageLoadErrorMarkup = !isLoading && pageLoadError ? (
    <AlphaCard>
      <div style={{margin: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4rem"}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem"}}>
          <Text variant="headingXl" as="h3">
            There was an error loading the pricing page
          </Text>
          <Text variant="bodyLg" as="p">
            Please try again later.
          </Text>
        </div>
      </div>
    </AlphaCard>
  ) : null

  return (
    <Page fullWidth>
      <TitleBar
        title="Plan"
        breadcrumbs={breadcrumbs}
        primaryAction={{
          content: "Plan Settings",
          onAction: () => navigate("/plan/settings")
        }}
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