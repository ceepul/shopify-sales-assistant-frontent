import { TitleBar, Loading, useAuthenticatedFetch } from "@shopify/app-bridge-react"
import { 
  AlphaCard,
  Layout,
  Page,
  Frame,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import ChatSessionList from "../components/ChatSessionList";
import ChatSessionDetail from "../components/ChatSessionDetail";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);

    // Add listener on mount
    mediaQuery.addEventListener('change', listener);
    // Remove listener on cleanup
    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export default function PlanPage() {
  const breadcrumbs = [{ content: "ShopMate", url: "/" }];

  const authFetch = useAuthenticatedFetch();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  const [toastActive, setToastActive] = useState(false);
  const toggleToast = useCallback(() => {
    setToastActive((active) => !active)
  }, []);

  const fetchSessions = async (filters, sortAscending, clear) => {
    setIsFetching(true);
    setListError(false);
    if (clear) setSessions([]);

    const shop = await authFetch("/api/shop", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.text());

    let url = `https://8sxn47ovn7.execute-api.us-east-1.amazonaws.com/session/list?shop=${shop}`
    url += !clear && cursor ? `&cursor=${cursor}` : ``;
    url += sortAscending ? `&sortDirection=asc` : ``;
    const urlFilters = filters ? filters.map(filter => {
      return `&${filter}=true`
    }) : ``;
    url += urlFilters ? urlFilters.join(``) : ``;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      setListError(true)
      setIsFetching(false);
      return;
    }
    
    const sessions = await response.json();
    if (sessions.length < 50) setHasNextPage(false);
    if (sessions.length > 0 && sessions[sessions.length - 1].id !== undefined) {
      setCursor(sessions[sessions.length - 1].id);
    }
    setSessions(prev => [...prev, ...sessions]);
    setIsFetching(false);
    return;
  };

  useEffect(() => {
    setIsLoading(true);
    fetchSessions().then(setIsLoading(false)).catch((err) => {
      setListError(true)
      setIsLoading(false);
    });
  }, []);

  const mobileMarkup = isMobile ? (
    activeSession === null ? (
      <AlphaCard padding={"0px"}>
        <ChatSessionList 
          isLoading={isLoading}
          error={listError}
          sessions={sessions}
          activeSession={activeSession}
          setActiveSession={setActiveSession}
          hasNextPage={hasNextPage}
          fetchSessions={fetchSessions}
          isFetching={isFetching}
        />
      </AlphaCard>
    ) : (
      <AlphaCard padding={"0px"}>
        <ChatSessionDetail 
          isLoading={isLoading}
          activeSession={activeSession}
          setActiveSession={setActiveSession}
          isMobile
        />
      </AlphaCard>
    )
  ) : null

  const desktopMarkup = !isMobile ? (
    <Layout>
      <Layout.Section oneThird>
        <AlphaCard padding={"0px"}>
          <ChatSessionList 
            isLoading = {isLoading}
            error = {listError}
            sessions={sessions}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            hasNextPage={hasNextPage}
            fetchSessions={fetchSessions}
            isFetching={isFetching}
          />
        </AlphaCard>
      </Layout.Section>

      <Layout.Section>
        <AlphaCard padding={"0px"}>
          <ChatSessionDetail 
            isLoading={isLoading}
            activeSession={activeSession}
          />
        </AlphaCard>
      </Layout.Section>
    </Layout>
  ) : null

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar
          title="Chat History"
          breadcrumbs={breadcrumbs}
        />
        {isLoading && <Loading />}
        {mobileMarkup}
        {desktopMarkup}
      </Page>
    </Frame>
  )
}