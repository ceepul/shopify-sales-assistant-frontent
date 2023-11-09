import React, { useRef, useEffect, useState } from 'react';
import {
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
  Text,
  Avatar,
  HorizontalStack,
  Icon,
  Spinner
} from "@shopify/polaris";
import {
  PlusMinor,
  ViewMinor,
  CashDollarMinor,
  ProductsMinor
} from '@shopify/polaris-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import CenteredDiv from "./CenteredDiv";
import './ChatSessionList.css'

export default function ChatSessionList({ isLoading, error, sessions, setActiveSession, hasNextPage, fetchSessions, isFetching }) {
  const sidebarRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current || !hasNextPage || isFetching) return;
  
      if (sidebarRef.current.scrollTop + sidebarRef.current.clientHeight >= sidebarRef.current.scrollHeight - 30) {
        fetchSessions();
      }
    };
  
    if (!isLoading && sidebarRef.current) {
      const sidebar = sidebarRef.current;
      sidebar.addEventListener('scroll', handleScroll);
  
      return () => {
        sidebar.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isLoading, fetchSessions]);

  const formatSessionDate = (sessionStart) => {
    const utcTimestamp = `${sessionStart}Z`
    const parsedStart = parseISO(utcTimestamp);
    return formatDistanceToNow(parsedStart, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Box minHeight="90vh">
        <div style={{padding: "8px"}}>
          <SkeletonDisplayText />
          <Box minHeight="2rem"/>
          <SkeletonBodyText lines={12}/>
        </div>
      </Box>
    )
  }

  if (error) {
    return (
      <CenteredDiv minHeight="90vh">
        <Text variant="headingMd">There was an problem fetching the sessions</Text>
        <Text>Please try again later.</Text>
      </CenteredDiv>
    )
  }

  const sessionsMarkup = sessions ? sessions.map((session) => {
    return (
      <div 
        key={session.id}
        className="session-card"
        onClick={() => setActiveSession(session.id)}
      >
        <div style={{padding: "12px"}}>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <HorizontalStack>
              <Avatar name={JSON.stringify(session.id)}/>
              <Box minWidth="1rem"/>
              <Text variant="headingMd">{`User#${session.id}`}</Text>
            </HorizontalStack>
            <HorizontalStack>
              {!session.hasConversion && <Icon source={CashDollarMinor} color="base"/>}
              {!session.hasAddToCart && <Icon source={PlusMinor} color="base"/>}
              {!session.hasProductView && <Icon source={ViewMinor} color="base"/>}
              {!session.hasRecommendation && <Icon source={ProductsMinor} color="base"/>}
            </HorizontalStack>
          </div>
          <Box minHeight="0.5rem"/>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Text truncate>
              {session.sessionTitle}
            </Text>
            <div style={{minWidth: "20%", display: "flex", justifyContent: "flex-end"}}>
              <Text variant="bodySm">{formatSessionDate(session.sessionStart)}</Text>
            </div>
          </div>
        </div>
        <Divider />
      </div>
    )
  }) : null

  return (
    <Box className="sidebar-container">
      <div style={{padding: "1rem", boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.25)"}}>
        <Text variant="headingLg">Sessions</Text>
        <Box minHeight="2em"/>
      </div>
      <Divider/>
      <Box ref={sidebarRef} className="sidebar-scroll">
        {sessionsMarkup}
        {isFetching && 
          <CenteredDiv minHeight='8rem'>
            <Spinner />
          </CenteredDiv>
        }
      </Box >
    </Box>
  )
}