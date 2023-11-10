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
  Button
} from "@shopify/polaris";
import {
  MobileCancelMajor
} from '@shopify/polaris-icons';
import CenteredDiv from "./CenteredDiv";
import "./ChatSessionDetail.css"

export default function ChatSessionDetail({ isLoading, activeSession, setActiveSession, isMobile }) {
  const [error, setError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchActiveSession = async () => {
    console.log(`Fetching session with ID: ${activeSession.id}`)
  }

  useEffect(() => {
    setIsFetching(true);
    setError(false);

    if (activeSession) fetchActiveSession().then(setIsFetching(false)).catch((err) => {
      setError(true)
      setIsFetching(false);
    });

    setIsFetching(false);
  }, [activeSession]);

  if (isLoading || isFetching) {
    return (
      <Box minHeight="89vh">
      <SkeletonDisplayText/>
      <Box minHeight="4em"/>
      <SkeletonBodyText lines={2} />
      <Box minHeight="2em"/>
      <Divider padding="4" />
    </Box>
    )
  }

  if (error) {
    return (
      <CenteredDiv minHeight="89vh">
        <Text variant="headingMd">We're having trouble fetching the chat</Text>
        <Text>Please try again later.</Text>
      </CenteredDiv>
    )
  }

  if (activeSession === null) {
    return (
      <CenteredDiv minHeight="89vh">
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

  return (
    <Box minHeight="89vh">
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
    </Box>
  )
}