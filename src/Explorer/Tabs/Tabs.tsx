import { MessageBar, MessageBarButton, MessageBarType } from "@fluentui/react";
import { sendMessage } from "Common/MessageHandler";
import { MessageTypes } from "Contracts/ExplorerContracts";
import { CollectionTabKind } from "Contracts/ViewModels";
import Explorer from "Explorer/Explorer";
import { SplashScreen } from "Explorer/SplashScreen/SplashScreen";
import { ConnectTab } from "Explorer/Tabs/ConnectTab";
import { PostgresConnectTab } from "Explorer/Tabs/PostgresConnectTab";
import { QuickstartTab } from "Explorer/Tabs/QuickstartTab";
import { useTeachingBubble } from "hooks/useTeachingBubble";
import ko from "knockout";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { userContext } from "UserContext";
import loadingIcon from "../../../images/circular_loader_black_16x16.gif";
import errorIcon from "../../../images/close-black.svg";
import { useObservable } from "../../hooks/useObservable";
import { ReactTabKind, useTabs } from "../../hooks/useTabs";
import TabsBase from "./TabsBase";

type Tab = TabsBase | (TabsBase & { render: () => JSX.Element });

interface TabsProps {
  explorer: Explorer;
}

export const Tabs = ({ explorer }: TabsProps): JSX.Element => {
  const { openedTabs, openedReactTabs, activeTab, activeReactTab, networkSettingsWarning } = useTabs();

  return (
    <div className="tabsManagerContainer">
      {networkSettingsWarning && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          actions={
            <MessageBarButton onClick={() => sendMessage({ type: MessageTypes.OpenPostgresNetworkingBlade })}>
              Change network settings
            </MessageBarButton>
          }
          messageBarIconProps={{ iconName: "WarningSolid", className: "messageBarWarningIcon" }}
        >
          {networkSettingsWarning}
        </MessageBar>
      )}
      <div id="content" className="flexContainer hideOverflows">
        <div className="nav-tabs-margin">
          <ul className="nav nav-tabs level navTabHeight" id="navTabs" role="tablist">
            {openedReactTabs.map((tab) => (
              <TabNav key={ReactTabKind[tab]} active={activeReactTab === tab} tabKind={tab} />
            ))}
            {openedTabs.map((tab) => (
              <TabNav key={tab.tabId} tab={tab} active={activeTab === tab} />
            ))}
          </ul>
        </div>
        <div className="tabPanesContainer">
          {activeReactTab !== undefined && getReactTabContent(activeReactTab, explorer)}
          {openedTabs.map((tab) => (
            <TabPane key={tab.tabId} tab={tab} active={activeTab === tab} />
          ))}
        </div>
      </div>
    </div>
  );
};

function TabNav({ tab, active, tabKind }: { tab?: Tab; active: boolean; tabKind?: ReactTabKind }) {
  const [hovering, setHovering] = useState(false);
  const focusTab = useRef<HTMLLIElement>() as MutableRefObject<HTMLLIElement>;
  const tabId = tab ? tab.tabId : "connect";

  useEffect(() => {
    if (active && focusTab.current) {
      focusTab.current.focus();
    }
  });
  return (
    <li
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => {
        if (tab) {
          tab.onTabClick();
        } else if (tabKind !== undefined) {
          useTabs.getState().activateReactTab(tabKind);
        }
      }}
      onKeyPress={({ nativeEvent: e }) => {
        if (tab) {
          tab.onKeyPressActivate(undefined, e);
        } else if (tabKind !== undefined) {
          onKeyPressReactTab(e, tabKind);
        }
      }}
      className={active ? "active tabList" : "tabList"}
      style={active ? { fontWeight: "bolder" } : {}}
      title={useObservable(tab?.tabPath || ko.observable(""))}
      aria-selected={active}
      aria-expanded={active}
      aria-controls={tabId}
      tabIndex={0}
      role="tab"
      ref={focusTab}
    >
      <span className="tabNavContentContainer">
        <a data-toggle="tab" href={"#" + tabId} tabIndex={-1}>
          <div className="tab_Content">
            <span className="statusIconContainer" style={{ width: tabKind === ReactTabKind.Home ? 0 : 18 }}>
              {useObservable(tab?.isExecutionError || ko.observable(false)) && <ErrorIcon tab={tab} active={active} />}
              {useObservable(tab?.isExecuting || ko.observable(false)) && (
                <img className="loadingIcon" title="Loading" src={loadingIcon} alt="Loading" />
              )}
            </span>
            <span className="tabNavText">{useObservable(tab?.tabTitle || ko.observable(ReactTabKind[tabKind]))}</span>
            {tabKind !== ReactTabKind.Home && (
              <span className="tabIconSection">
                <CloseButton tab={tab} active={active} hovering={hovering} tabKind={tabKind} />
              </span>
            )}
          </div>
        </a>
      </span>
    </li>
  );
}

const CloseButton = ({
  tab,
  active,
  hovering,
  tabKind,
}: {
  tab: Tab;
  active: boolean;
  hovering: boolean;
  tabKind?: ReactTabKind;
}) => (
  <span
    style={{ display: hovering || active ? undefined : "none" }}
    title="Close"
    role="button"
    aria-label="Close Tab"
    className="cancelButton"
    onClick={(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event.stopPropagation();
      tab ? tab.onCloseTabButtonClick() : useTabs.getState().closeReactTab(tabKind);
    }}
    tabIndex={active ? 0 : undefined}
    onKeyPress={({ nativeEvent: e }) => tab.onKeyPressClose(undefined, e)}
  >
    <span className="tabIcon close-Icon">
      <img src={errorIcon} title="Close" alt="Close" />
    </span>
  </span>
);

const ErrorIcon = ({ tab, active }: { tab: Tab; active: boolean }) => (
  <div
    id="errorStatusIcon"
    role="button"
    title="Click to view more details"
    tabIndex={active ? 0 : undefined}
    className={active ? "actionsEnabled errorIconContainer" : "errorIconContainer"}
    onClick={({ nativeEvent: e }) => tab.onErrorDetailsClick(undefined, e)}
    onKeyPress={({ nativeEvent: e }) => tab.onErrorDetailsKeyPress(undefined, e)}
  >
    <span className="errorIcon" />
  </div>
);

function TabPane({ tab, active }: { tab: Tab; active: boolean }) {
  const ref = useRef<HTMLDivElement>();
  const attrs = {
    style: { display: active ? undefined : "none" },
    className: "tabs-container",
  };

  useEffect((): (() => void) | void => {
    if (tab.tabKind === CollectionTabKind.Documents && tab.collection?.isSampleCollection) {
      useTeachingBubble.getState().setIsDocumentsTabOpened(true);
    }

    const { current: element } = ref;
    if (element) {
      ko.applyBindings(tab, element);
      const ctx = ko.contextFor(element).createChildContext(tab);
      ko.applyBindingsToDescendants(ctx, element);
      tab.isTemplateReady(true);
      return () => ko.cleanNode(element);
    }
  }, [ref, tab]);

  if (tab) {
    if ("render" in tab) {
      return <div {...attrs}>{tab.render()}</div>;
    }
  }

  return <div {...attrs} ref={ref} data-bind="html:html" />;
}

const onKeyPressReactTab = (e: KeyboardEvent, tabKind: ReactTabKind): void => {
  if (e.key === "Enter" || e.key === "Space") {
    useTabs.getState().activateReactTab(tabKind);
    e.stopPropagation();
  }
};

const getReactTabContent = (activeReactTab: ReactTabKind, explorer: Explorer): JSX.Element => {
  switch (activeReactTab) {
    case ReactTabKind.Connect:
      return userContext.apiType === "Postgres" ? <PostgresConnectTab /> : <ConnectTab />;
    case ReactTabKind.Home:
      return <SplashScreen explorer={explorer} />;
    case ReactTabKind.Quickstart:
      return <QuickstartTab explorer={explorer} />;
    default:
      throw Error(`Unsupported tab kind ${ReactTabKind[activeReactTab]}`);
  }
};
