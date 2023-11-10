import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  SkeletonDisplayText,
  SkeletonBodyText,
  Divider,
  Box,
  Text,
  Avatar,
  HorizontalStack,
  Icon,
  Spinner,
  Button,
  Popover,
  OptionList
} from "@shopify/polaris";
import {
  PlusMinor,
  ViewMinor,
  CashDollarMinor,
  ProductsMinor,
  SortAscendingMajor,
  SortDescendingMajor,
  DropdownMinor
} from '@shopify/polaris-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import CenteredDiv from "./CenteredDiv";
import './ChatSessionList.css'

export default function ChatSessionList({ isLoading, error, sessions, activeSession, setActiveSession, hasNextPage, fetchSessions, isFetching }) {
  const sidebarRef = useRef();
  const [filters, setFilters] = useState([]);
  const [sortAscending, setSortAscending] = useState(false);

  const [popoverActive, setPopoverActive] = useState(false);
  const togglePopoverActive = useCallback(() => {
    setPopoverActive((popoverActive) => !popoverActive)
  }, []);

  const handleFilterChange = (filters) => {
    setFilters(filters)
    fetchSessions(filters, sortAscending, true)
  }

  const handleSortChange = () => {
    setSortAscending(prev => !prev)
    fetchSessions(filters, sortAscending, true)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current || !hasNextPage || isFetching) return;
  
      if (sidebarRef.current.scrollTop + sidebarRef.current.clientHeight >= sidebarRef.current.scrollHeight - 30) {
        fetchSessions(filters, sortAscending);
      }
    };
  
    if (!isLoading && sidebarRef.current) {
      const sidebar = sidebarRef.current;
      sidebar.addEventListener('scroll', handleScroll);
  
      return () => {
        //sidebar.removeEventListener('scroll', handleScroll);
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

  const sessionsMarkup = sessions.length ? sessions.map((session) => {
    return (
      <div 
        key={session.id}
        className={`session-card ${activeSession === session.id ? 'active-session' : ''}`}
        onClick={() => setActiveSession(session)}
      >
        <div style={{padding: "12px"}}>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <HorizontalStack>
              <Avatar name={JSON.stringify(session.id)}/>
              <Box minWidth="1rem"/>
              <Text variant="headingMd">{`User#${session.id}`}</Text>
            </HorizontalStack>
            <HorizontalStack>
              {session.hasConversion && <Icon source={CashDollarMinor} color="base"/>}
              {session.hasAddToCart && <Icon source={PlusMinor} color="base"/>}
              {session.hasProductView && <Icon source={ViewMinor} color="base"/>}
              {session.hasRecommendation && <Icon source={ProductsMinor} color="base"/>}
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
  }) : (
    !isLoading && !isFetching && 
    <CenteredDiv minHeight="90vh">
      <Text variant="headingMd">No Sessions Yet</Text>
      <Text>Check back later.</Text>
    </CenteredDiv>
  )

  return (
    <Box className="sidebar-container">
      <div style={{display: "flex", justifyContent: "space-between", alignItems: 'center', padding: "1rem", boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.25)"}}>
        <Popover
          active={popoverActive}
          activator={
            <button onClick={togglePopoverActive} className='filter-button'>
              <HorizontalStack>
                <Text>Filters</Text>
                <Icon source={DropdownMinor} color='base'/>
              </HorizontalStack>
            </button>
          }
          onClose={togglePopoverActive}
        >
          <OptionList
            title="Chat Events"
            onChange={handleFilterChange}
            options={[
              {
                value: 'hasRecommendation', 
                label: <HorizontalStack blockAlign="center" gap="1">
                          <Icon source={ProductsMinor} color='base'/>
                          <Text>Recommendation</Text>
                        </HorizontalStack>
              },
              {
                value: 'hasProductView', 
                label: <HorizontalStack blockAlign="center" gap="1">
                          <Icon source={ViewMinor} color='base'/>
                          <Text>Product View</Text>
                        </HorizontalStack>
              },
              {
                value: 'hasAddToCart', 
                label: <HorizontalStack blockAlign="center" gap="1">
                          <Icon source={PlusMinor} color='base'/>
                          <Text>Add to Cart</Text>
                        </HorizontalStack>
              },
              {
                value: 'hasConversion', 
                label: <HorizontalStack blockAlign="center" gap="1">
                          <Icon source={CashDollarMinor} color='base'/>
                          <Text>Conversion</Text>
                        </HorizontalStack>
              },
            ]}
            selected={filters}
            allowMultiple
          />
        </Popover>

        <Text variant='headingLg'>Chats</Text>
        
        <button onClick={handleSortChange} className="filter-button">
          <HorizontalStack>
            <Text>Date</Text>
            <Icon source={sortAscending ? SortAscendingMajor : SortDescendingMajor}/>
          </HorizontalStack>
        </button>
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