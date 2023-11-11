import { useEffect, useState } from "react";
import {
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
  Text,
  HorizontalStack,
  Avatar,
  VerticalStack,
  Icon,
  Button,
  Spinner
} from "@shopify/polaris";
import {
  MobileCancelMajor
} from '@shopify/polaris-icons';
import CenteredDiv from "./CenteredDiv";
import ProductContainer from "./ProductContainer";
import "./ChatSessionDetail.css"

export default function ChatSessionDetail({ isLoading, activeSession, setActiveSession, isMobile }) {
  const [error, setError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const [sessionEvents, setSessionEvents] = useState(null);

  const fetchActiveSession = async () => {
    const response = await fetch(`https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/session/events?sessionId=${activeSession.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      setError(true)
      setIsFetching(false);
      return;
    }

    return await response.json();
  }

  function sortEvents(messages, recommendationEvents) {
    // Add an identifier to each message
    const messagesWithId = messages.map(msg => ({
      ...msg,
      type: 'message',
      timestamp: msg.sentAt
    }));
  
    // Add an identifier to each recommendation event
    const recommendationEventsWithId = recommendationEvents.map(re => ({
      ...re,
      type: 'recommendation',
      timestamp: re.recommendedAt
    }));
  
    // Merge and sort the arrays
    const mergedArray = [...messagesWithId, ...recommendationEventsWithId];
    mergedArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
    setSessionEvents(mergedArray);
    console.log(mergedArray)
  }
  
  useEffect(() => {
    if (activeSession) {
      setIsFetching(true);
      setError(false);

      fetchActiveSession().then(eventData => {
        sortEvents(eventData.messages, eventData.recommendationEvents);
      }).catch((err) => {
        console.error(err);
        setError(true);
      }).finally(() => {
        setIsFetching(false);
      });
    }
  }, [activeSession]);

  if (isLoading || isFetching) {
    return (
      <Box minHeight="90vh">
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "1fr 1fr", // Three columns if mobile, otherwise two
          gap: "1rem",
          alignItems: "center",
          padding: "1.5rem",
          boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.25)"
        }}>
          {isMobile && 
            <div>
              <button onClick={() => setActiveSession(null)} className="mobile-close-button">
                <Icon source={MobileCancelMajor}/>
              </button>
            </div>
          }
          <SkeletonDisplayText/>
          <div>
            <SkeletonBodyText lines={2} />
          </div>
        </div>
        <Divider padding="4" />
        <CenteredDiv minHeight="70vh">
          <Spinner />
        </CenteredDiv>
      </Box>
    )
  }

  if (error) {
    return (
      <CenteredDiv minHeight="90vh">
        <Text variant="headingMd">We're having trouble fetching the chat</Text>
        <Text>Please try again later.</Text>
      </CenteredDiv>
    )
  }

  if (activeSession === null) {
    return (
      <CenteredDiv minHeight="90vh">
        <Text variant="headingMd">Select a Session to View Chats</Text>
      </CenteredDiv>
    )
  }

  function formatDuration(durationStr) {
    // Check if durationStr is null or undefined
    if (!durationStr) return '';

    // Regular expression to extract the time components
    const regex = /(\d+) years (\d+) mons (\d+) days (\d+) hours (\d+) mins (\d+(\.\d+)?) secs/;
    const matches = durationStr.match(regex);
  
    // Check if the duration string matches the expected format
    if (!matches) return durationStr;
  
    const [, years, mons, days, hours, mins, secs] = matches.map(Number);
  
    let formattedDuration = '';
    if (years > 0) formattedDuration += `${years} years `;
    if (mons > 0) formattedDuration += `${mons} mons `;
    if (days > 0) formattedDuration += `${days} days `;
    if (hours > 0) formattedDuration += `${hours} hours `;
    if (mins > 0) formattedDuration += `${mins} mins `;
    formattedDuration += `${secs.toFixed(0)} secs`;
  
    return formattedDuration.trim();
  }

  const chatMarkup = sessionEvents && sessionEvents.length ? (
    sessionEvents.map((event, index) => {
      switch (event.type) {
        case 'message':
          if (event.sender === 'user') {
            return (
              <div key={index} className="chat-widget__user-message">
                <p className="chat-widget__user-text">{event.messageText}</p>
              </div>
            )
          } else if (event.sender === 'assistant') {
            return (
              <div key={index} className="chat-widget__assistant-message">
                <p className="chat-widget__assistant-text">{event.messageText}</p>
              </div>
            )
          }
          break;
        case 'recommendation':
          return (
           <div key={index}><ProductContainer productIds={event.productIds} /></div>
          )
          break;
        case 'view':
          console.log(`Product View event: ${JSON.stringify(event)}`)
          break;
        case 'atc':
          console.log(`Add to cart event: ${JSON.stringify(event)}`)
          break;
        case 'conversion':
          console.log(`Conversion event: ${JSON.stringify(event)}`)
          break;
        default:
          console.log("Unknown event type.")
      }
    })
  ) : (
    <CenteredDiv minHeight="70vh">
      <Text variant="headingMd">No data</Text>
    </CenteredDiv>
  )

  return (
    <Box className="chat-details-container">
      <div style={{display: "flex", justifyContent: "space-between", alignItems: 'center', padding: "1.5rem", boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.25)"}}>
        {isMobile && 
          <button onClick={() => setActiveSession(null)} className="mobile-close-button">
            <Icon source={MobileCancelMajor}/>
          </button>
        }
        <HorizontalStack blockAlign="center">
          <Avatar name={JSON.stringify(activeSession.id)}/>
          <Box minWidth="1rem"/>
          <Text variant="headingMd">{`User#${activeSession.id}`}</Text>
        </HorizontalStack>
        <VerticalStack inlineAlign='end'>
          <Text>18 Messages</Text>
          <Text>{formatDuration(activeSession.sessionDuration)}</Text>
        </VerticalStack>
      </div>
      <div className="chat-widget__body-container">
        {chatMarkup}
      </div>
    </Box>
  )
}