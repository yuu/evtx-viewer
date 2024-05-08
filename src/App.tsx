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
        {events.map((ev) => {
          return (
            <tr>
              <td></td>
              <td>2</td>
              <td>{ev.Event.System.Provider['#attributes']?.EventSourcName}</td>
              <td>{ev.Event.System.EventID}</td>
              <td>ID: {ev.Event.System.Task}</td>
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
