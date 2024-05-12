import { match, P }from 'ts-pattern'
import { useState } from "react";
import { invoke } from '@tauri-apps/api/core';
import { info, error } from '@tauri-apps/plugin-log';
import "./App.css";

const useOpenLog = () => {
  const [events, setEvents] = useState<Array<any>>([]);

  const open = async () => {
    info('START open_file_dialog');
    try {
      const res = await invoke("open_file_dialog")
      setEvents(res as Array<any>);
    } catch (err) {
      const e = err as Error;
      error(e.message);
    }
    info("  END open_file_dialog");
  };

  return { events, open };
};

const Table = ({ events }: { events: Array<any> }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>レベル</th>
          <th>日付と時刻</th>
          <th>ソース</th>
          <th>イベントID</th>
          <th>タスクのカテゴリ</th>
        </tr>
      </thead>
      <tbody>
        {events.map((ev, idx) => {
          return (
            <tr key={idx}>
              <td>
                {match(ev.Event.System.Level)
                  .with(0, ()=> 'INFO')
                  .with(1, ()=> 'CRITICAL')
                  .with(2, ()=> 'ERR')
                  .with(3, ()=> 'WARN')
                  .with(4, ()=> 'INFO')
                  .with(5, ()=> 'VERBOSE')
                  .otherwise(lv => lv)}
              </td>
              <td>{ev.Event.System.TimeCreated['#attributes']?.SystemTime}</td>
              <td>{ev.Event.System.Provider['#attributes']?.EventSourcName}</td>
              <td>
                {match(ev.Event.System.EventID)
                   .with(P.number, (x) => x)
                   .with({ '#attributes': P._ }, (x) => x['#attributes'].Qualifiers)
                   .otherwise(() => null)}
              </td>
              <td>ID: {ev.Event.System.Task.toString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function App() {
  const { events, open } = useOpenLog();

  return (
    <div className="container">
      <button onClick={open}>Click to open dialog</button>
      <Table events={events} />
    </div>
  );
}

export default App;
