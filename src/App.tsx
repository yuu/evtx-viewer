import { match, P }from 'ts-pattern'
import { useState } from "react";
import { invoke } from '@tauri-apps/api/core';
import { info, error } from '@tauri-apps/plugin-log';
import { I18nProvider } from '@cloudscape-design/components/i18n';
import Button from "@cloudscape-design/components/button"
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import { AppLayout, Container, ContentLayout, Link, SplitPanel } from '@cloudscape-design/components';
import messages from '@cloudscape-design/components/i18n/messages/all.ja';

import "@cloudscape-design/global-styles/index.css"
import "./App.css";

const useOpenLog = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<Array<any>>([]);

  const open = async () => {
    info('START open_file_dialog');
    setLoading(true);
    try {
      const res = await invoke("open_file_dialog")
      setEvents(res as Array<any>);
    } catch (err) {
      const e = err as Error;
      error(e.message);
    }
    setLoading(false);
    info("  END open_file_dialog");
  };

  return { events, open, loading };
};

const LogTable = ({
  selectedItems,
  setSelectedItems
}) => {
  const { events, open, loading } = useOpenLog();

  const columnDefinitions = [
      {
        id: "level",
        header: "レベル",
        cell: item => match(item.Event.System.Level)
          .with(0, ()=> 'INFO')
          .with(1, ()=> 'CRITICAL')
          .with(2, ()=> 'ERR')
          .with(3, ()=> 'WARN')
          .with(4, ()=> 'INFO')
          .with(5, ()=> 'VERBOSE')
          .otherwise(lv => lv),
      },
      {
        id: "systemTime",
        header: "日付と時刻",
        cell: item => item.Event.System.TimeCreated['#attributes']?.SystemTime,
      },
      {
        id: "eventSourceName",
        header: "ソース",
        cell: item => item.Event.System.Provider['#attributes']?.EventSourcName,
      },
      {
        id: "eventId",
        header: "イベントID",
        cell: item => match(item.Event.System.EventID)
          .with(P.number, (x) => x)
          .with({ '#attributes': P._ }, (x) => x['#attributes'].Qualifiers)
          .otherwise(() => null),
      },
      {
        id: "task",
        header: "タスクのカテゴリ",
        cell: item => item.Event.System.Task.toString(),
      },
  ];

  const columnDisplay = [
    { id: "level", visible: true },
    { id: "systemTime", visible: true },
    { id: "eventSourceName", visible: true },
    { id: "eventId", visible: true },
    { id: "task", visible: true },
  ];

  return (
    <Table
      loading={loading}
      items={events}
      onSelectionChange={({ detail }) =>
        setSelectedItems(detail.selectedItems)
      }
      onRowClick={(event) => {
        setSelectedItems([event.detail.item])
      }}
      selectedItems={selectedItems}
      columnDefinitions={columnDefinitions}
      columnDisplay={columnDisplay}
      enableKeyboardNavigation
      stickyHeader
      contentDensity="compact"
      selectionType="single"
      empty={
        <Box
          margin={{ vertical: "xs" }}
          textAlign="center"
          color="inherit"
        >
          <SpaceBetween size="m">
            <b>No resources</b>
            <Button onClick={open}>open log file</Button>
          </SpaceBetween>
        </Box>
      }
      header={
        <Header>
          {events.length === 0 ? null : "ファイル名"}
        </Header>
      }
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={{
            pageSize: 10,
            contentDisplay: columnDisplay
          }}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 resources" },
              { value: 20, label: "20 resources" }
            ]
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              { id: "level", label: "レベル" },
              { id: "systemTime", label: "日付と時刻" },
              { id: "eventSourceName", label: "ソース" },
              { id: "eventId", label: "イベントID" },
              { id: "task", label: "タスクのカテゴリ" },
            ]
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description:
                "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 }
              ]
            },
            lastColumns: {
              title: "Stick last column",
              description:
                "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 }
              ]
            }
          }}
        />
      }
    />
  );
};

function App() {
  const [
    selectedItems,
    setSelectedItems
  ] = useState([]);

  return (
    <I18nProvider locale={"ja"} messages={[messages]}>
      <AppLayout
        toolsOpen={false}
        navigationOpen={false}
        splitPanelOpen={true}
        splitPanel={(
          <SplitPanel header="Log Details">
            {selectedItems.length === 0 ? null : (
              <div>
                {selectedItems[0].Event.System.TimeCreated['#attributes']?.SystemTime}
              </div>
            )}
          </SplitPanel>
        )}
        content={
          <LogTable selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
        }
      />
    </I18nProvider>
  );
}

export default App;
