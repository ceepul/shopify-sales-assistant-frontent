import {
  AlphaCard,
  Box,
  Text,
  Spinner,
  Icon
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import {
  ViewMinor
} from '@shopify/polaris-icons';

export default function ProductViewsCardSmall({ shop, subscriptionStartDate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [totalProductViews, setTotalProductViews] = useState(0);
  const [oneDayProductViews, setOneDayProductViews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/stats/product-view-events?shop=${shop}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          setError({
            status: true, 
            title: "Could not load product views", 
            body: "There was a problem fetching the product views data. Please try again later."
          })
          setIsLoading (false)
          return;
        }

        const data = await response.json();
        setOneDayProductViews(data.oneDayProductViews);
        setTotalProductViews(data.totalProductViews)

        setError({ status: false, title: "", body: "" });
  
      } catch (error) {
        console.error(error)
        setError({
          status: true, 
          title: "Could not load product views", 
          body: "There was a problem fetching the product views data. Please try again later."
        })
      }
  
      setIsLoading(false);
    };
  
    fetchData();
  }, []);

  const loadingMarkup = isLoading ? (
    <div style={{height: "4.75rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Spinner size="large" accessibilityLabel="Loading chart spinner"/>
    </div>
  ) : null

  const errorMarkup = (!isLoading && error.status) ? (
    <div style={{ height: "4.75rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Text>{error.title}</Text>
    </div>
  ) : null

  const cardMarkup = (!isLoading && !error.status) ? (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text variant="bodyLg">Product Views</Text>
        <div><Icon source={ViewMinor} color="base"/></div>
      </div>
      <Box minHeight="0.5rem"/>
      <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem'}}>
        <Text variant="heading2xl">{totalProductViews}</Text>
        <Text variant="bodyMd">{`+${oneDayProductViews} last day`}</Text>
      </div>
      <Box minHeight="0.3rem"/>
      <Text variant="bodySm">All time</Text>
    </div>
  ) : null

  return (
    <AlphaCard>
      {loadingMarkup}
      {errorMarkup}
      {cardMarkup}
    </AlphaCard>
  )
}