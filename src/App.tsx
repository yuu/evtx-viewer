import { match, P }from 'ts-pattern'
import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function handleOpenFileDialog() {
  invoke("open_file_dialog")
    .then((response) => console.log(response))
    .catch((error) => console.error(error));
}

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
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unlisten = listen("evtx-data", (event) => {
      setEvents(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="container">
      <button onClick={handleOpenFileDialog}>Click to open dialog</button>
      <Table events={events} />
    </div>
  );
}

export default App;
