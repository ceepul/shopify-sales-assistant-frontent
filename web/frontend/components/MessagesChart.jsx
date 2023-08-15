import { useState, useEffect, useRef } from "react";
import {
  AlphaCard,
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
  Text,
  Spinner,
  Button,
  HorizontalStack,
} from "@shopify/polaris";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MessagesChart({ shop }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState({
    status: false,
    title: "",
    body: "",
  });
  const [timePeriod, setTimePeriod] = useState('24hr');
  const [messageData, setMessageData] = useState(null)
  
  const getDummyData = (period) => {
    return { data: Array(50).fill(0).map(() => Math.random() * 100) };
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      let timePeriodInHours;

      switch (timePeriod) {
        case '24hr':
          timePeriodInHours = 24;
          break;
        case '1w':
          timePeriodInHours = 24 * 7;
          break;
        case '1m':
          timePeriodInHours = 24 * 30;
          break;
        case '6m':
          timePeriodInHours = 24 * 30 * 6;
        default:
          // Handle an unexpected value here if needed
          timePeriodInHours = 0;
          break;
      }

      try {
        const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/stats/messages?shop=${shop}&timePeriod=${timePeriodInHours}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          setError({
            status: true, 
            title: "Could not load messages", 
            body: "There was a problem fetching the message data. Please try again later."
          })
        }

        const data = await response.json();
        console.log(data)
        
        // Format the data here, then setMessageData(data)
        setMessageData(data)
  
      } catch (error) {
        console.error('There was an error fetching message data:', error);
        setError({
          status: true, 
          title: "Could not load messages", 
          body: "There was a problem fetching the message data. Please try again later."
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
        bottom: 80,
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
        grid: {
          display: false,
        },
      },
    },
  };

  const totalMessagesInTimePeriod = 129;

  const labels = getLabels('24hr')

  const data = {
    labels: labels,
    datasets: [{
      label: 'Messages',
      data: messageData,
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
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
    <Box style={{height: "20rem"}}>
      <div style={{ display: "flex", justifyContent: "space-between"}}>
        <Text variant="headingMd" as="h6">
          Messages
        </Text>
        <HorizontalStack gap="4">
          {timeButton('24hr')}
          {timeButton('1w')}
          {timeButton('1m')}
          {timeButton('6m')}
        </HorizontalStack>
      </div>
      <Box minHeight="1em"/>
      <Divider />
      <div style={{height: "16rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <Spinner size="large" accessibilityLabel="Loading chart spinner"/>
      </div>
    </Box>
  ) : null

  const chartMarkup = !isLoading ? (
    <Box style={{height: "20rem"}}>
      <div style={{ display: "flex", justifyContent: "space-between"}}>
        <Text variant="headingMd" as="h6">
          Messages
        </Text>
        <HorizontalStack gap="4">
          {timeButton('24hr')}
          {timeButton('1w')}
          {timeButton('1m')}
          {timeButton('6m')}
        </HorizontalStack>
      </div>
      <Box minHeight="1em"/>
      <Divider />
      <Box minHeight="0.5em"/>
      <Text>Messages ({timePeriod}): <strong>{totalMessagesInTimePeriod}</strong></Text>
      <Box minHeight="1.5em"/>
      {/*TO DO: If there is an error with chart data show it in place of the chart */}
      <Line options={options} data={data} />
    </Box>
  ) : null

  return (
    <AlphaCard>
      {loadingMarkup}
      {chartMarkup}
    </AlphaCard>
  )
}

const getLabels = (period) => {
  const now = new Date();
  let labels = [];
  let step, format;

  switch (period) {
    case '24hr':
      step = 4; // Divide 24 hours into 6 equal steps
      for (let i = 0; i < 6; i++) {
        let date = new Date(now);
        date.setHours(now.getHours() - step * i);
        let hours = date.getHours();
        let formattedTime = ('0' + hours).slice(-2) + ':00';
        labels.unshift(formattedTime);
      }
      break;
    case '1w':
      step = 1; // 1 day step
      format = 'MM/DD';
      for (let i = 6; i >= 0; i--) {
        let date = new Date(now);
        date.setDate(now.getDate() - step * i);
        labels.push(('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2));
      }
      break;
    case '1m':
      step = Math.ceil(28 / 4); // Divide 30 days into 4 steps
      format = 'MM/DD';
      for (let i = 4; i >= 0; i--) {
        let date = new Date(now);
        date.setDate(now.getDate() - step * i);
        labels.push(('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2));
      }
      break;
    case '6m':
      for (let i = 0; i < 6; i++) {
        let date = new Date(now);
        date.setMonth(now.getMonth() - i);
        let monthName = date.toLocaleString('default', { month: 'short' });
        labels.unshift(monthName);
      }
      break;
  }

  return labels;
};