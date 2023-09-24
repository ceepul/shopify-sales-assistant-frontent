import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import AppStateProvider from "./contexts/AppStateContext";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <AppStateProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Customize",
                    destination: "/customize",
                  },
                  {
                    label: "Setup",
                    destination: "/setup",
                  },
                  {
                    label: "Plan",
                    destination: "/plan",
                  },
                  {
                    label: "Getting Started",
                    destination: "/getting-started",
                  },
                ]}
              />
              <Routes pages={pages} />
            </AppStateProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}