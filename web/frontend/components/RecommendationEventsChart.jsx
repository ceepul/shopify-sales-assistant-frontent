import { useState, useEffect } from "react";
import {
  AlphaCard,
  Divider,
  Box,
  Text,
  Spinner,
  Button,
  Tooltip,
  Icon
} from "@shopify/polaris";
import { InfoMinor } from '@shopify/polaris-icons';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartJSToolTip,
} from "chart.js";
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartJSToolTip,
);

export default function RecommendationEventsChart({ shop }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [timePeriod, setTimePeriod] = useState('24hr');
  const [recommendationData, setrecommendationData] = useState({ labels: [], data: [] })
  const [totalrecommendationsInTimePeriod, setTotalrecommendationsInTimePeriod] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/stats/recommendations?shop=${shop}&timePeriod=${timePeriod}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          setError({
            status: true, 
            title: "Could not load recommendations", 
            body: "There was a problem fetching the recommendation data. Please try again later."
          })
          setIsLoading (false)
          return;
        }

        const data = await response.json();

        if (timePeriod === '24hr') { // If time period is in hours, adjust labels to match time zone
          const adjustedLabels = adjustTimeZone(data.labels)
          setrecommendationData({ labels: adjustedLabels, data: data.data })
        } else {
          setrecommendationData(data)
        }
        
        const totalrecommendations = data.data.reduce((total, entry) => {
          return total + (entry ? entry : 0);
        }, 0);
        setTotalrecommendationsInTimePeriod(totalrecommendations)

        setError({ status: false, title: "", body: "" });
  
      } catch (error) {
        console.error('There was an error fetching recommendation data:', error);
        setError({
          status: true, 
          title: "Could not load recommendations", 
          body: "There was a problem fetching the recommendation data. Please try again later."
        })
      }
  
      setIsLoading(false);
    };
  
    fetchData();
  }, [timePeriod]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        right: 0,
        bottom: 100,
        left: 0
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 8
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const data = {
    labels: recommendationData.labels,
    datasets: [{
      label: 'Recommendations',
      data: recommendationData.data,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.25
    }]
  };

  const timeButton = (label) => (
    <Button
      plain
      monochrome={timePeriod === label}
      onClick={() => setTimePeriod(label)}
    >
      {label}
    </Button>
  )  

  const loadingMarkup = isLoading ? (
    <div style={{height: "16rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Spinner size="large" accessibilityLabel="Loading chart spinner"/>
    </div>
  ) : null

  const errorMarkup = (!isLoading && error.status) ? (
    <div style={{ height: "10rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Text>{error.title}</Text>
    </div>
  ) : null

  const chartMarkup = (!isLoading && !error.status) ? (
      <Line options={options} data={data} />
  ) : null

  return (
    <AlphaCard>
      <Box style={{height: "20rem"}}>
        <div style={{ display: "flex", justifyContent: "space-between"}}>
          <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <Text variant="headingMd" as="h6">
              Product Recommendations
            </Text>
            <Tooltip content={`This chart shows the number of products recommended to user's by the shopping assistant in the last ${timePeriod}.`}>
              <Icon source={InfoMinor} color="base" />
            </Tooltip>
          </div>
          <div style={{display: "flex", gap: "1rem"}}>
            {timeButton('24hr')}
            {timeButton('1w')}
            {timeButton('1m')}
            {timeButton('6m')}
          </div>
        </div>
        <Box minHeight="1em"/>
        <Divider />
        <Box minHeight="0.5em"/>
        <Text>Total ({timePeriod}): <strong>{totalrecommendationsInTimePeriod}</strong></Text>
        <Box minHeight="1.5em"/>
        {loadingMarkup}
        {errorMarkup}
        {chartMarkup}
      </Box>
    </AlphaCard>
  )
}

const adjustTimeZone = (labels) => {
  const adjustedLabels = labels.map(label => {
      // Convert label to a date object
      const currentDate = new Date();
      const [hour, minute] = label.split(':');
      currentDate.setUTCHours(hour, minute);

      // Format the date object to the desired format in local time
      let adjustedHour = currentDate.getHours().toString().padStart(2, '0');
      let adjustedMinute = currentDate.getMinutes().toString().padStart(2, '0');
      
      return `${adjustedHour}:${adjustedMinute}`;
  });

  return adjustedLabels;
};