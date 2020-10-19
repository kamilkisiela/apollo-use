import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

function NestedUpdateCleaner() {
  const [, setState] = React.useState({
    mounted: false,
  });

  React.useEffect(() => {
    setState({ mounted: true });
  }, [])

  return <div />;
}

async function forceReleaseMemoryAfterAppUnmount() {
  const body = document.body;
  const memoryCleanupDiv = document.createElement("div");
  memoryCleanupDiv.setAttribute("id", "memory-cleanup");

  const memoryCleanupContainer = body.appendChild(memoryCleanupDiv);

  /**
   * Render React component to force memory leak cleanup (handles, detached
   * window case).
   */
  await sleep(0);

  ReactDOM.render(
    <NestedUpdateCleaner />,
    memoryCleanupContainer
  );

  /**
   * Now that memory is freed up, clean up React components rendered in
   * previous line, as well as the <div id="memory-cleanup" /> container
   */
  ReactDOM.unmountComponentAtNode(memoryCleanupContainer);
  body.removeChild(memoryCleanupContainer);
}

setTimeout(async () => {
  ReactDOM.unmountComponentAtNode(rootElement)
  document.body.removeChild(rootElement);
  console.log('unmounted')
  await forceReleaseMemoryAfterAppUnmount();
  console.log('released')
}, 10000)

setTimeout(() => {
  console.log('take snapshot')
}, 20000)