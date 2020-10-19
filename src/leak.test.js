import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { ApolloProvider, gql, useQuery, useSubscription } from "@apollo/client";
import weak from "weak-napi";
import { PubSub } from 'graphql-subscriptions';
import { createClient } from "./client";

function waitFor(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

describe('leak', () => {
  let client;
  let pubsub;

  beforeEach(() => {
    pubsub = new PubSub();
    client = createClient(pubsub);
  })

  afterEach(() => {
    client = undefined;
    pubsub = undefined;
  })

  test(
    "subscription",
    async (done) => {
      class MyContext {
        constructor() {
          this.foo = "bar";
        }
      }
  
      let myContext = new MyContext();
  
      weak(myContext, function () {
        console.log(`YES! Context is no longer in memory!`);
        done();
      });
  
      function First() {
        useSubscription(
          gql`
            subscription ping {
              ping
            }
          `,
          {
            context: myContext,
          }
        );
  
        return <Second />;
      }
  
      function Second() {
        useSubscription(
          gql`
            subscription ping {
              ping
            }
          `,
          {
            context: myContext,
          }
        );
  
        return null;
      }
  
      function Test() {
        const [show, setShow] = React.useState(true);
        // const [update, forceUpdate] = React.useState(1);
  
        React.useEffect(() => {
          const t1 = setTimeout(() => {
            setShow(false);
          }, 1000);
          // const t2 = setTimeout(() => {
          //   console.log('force update')
          //   forceUpdate(update+1)
          // }, 2000);
          return () => {
            clearTimeout(t1)
            // clearTimeout(t2)
          }
        }, [setShow]);
  
        return show ? (
          <div data-testid="test">
            Enabled
            <First />
          </div>
        ) : <div>Disabled</div>;
      }
  
      function App() {
        React.useRef(myContext);

        return (
          <div>
            App
            <ApolloProvider client={client}>
              <Test />
            </ApolloProvider>
          </div>
        );
      }
  
      let app = render(<App />);
      await waitFor(10000);
      app.debug();
      app.unmount();
      app.debug();
      app = undefined;
      myContext = undefined;
      client = undefined;
      pubsub = undefined;
      global.gc();
      await waitFor(3000);
    },
    40 * 1000
  );
  
  test.skip(
    "query",
    async (done) => {
      class MyContext {
        constructor() {
          this.foo = "bar";
        }
      }
  
      let myContext = new MyContext();
  
      weak(myContext, function () {
        console.log(`YES! Context is no longer in memory!`);
        done();
      });
  
      function First() {
        useQuery(
          gql`
            query foo {
              foo
            }
          `,
          {
            context: myContext,
          }
        );
  
        return <Second />;
      }
  
      function Second() {
        useQuery(
          gql`
            query foo {
              foo
            }
          `,
          {
            context: myContext,
          }
        );
  
        return null;
      }
  
      function Test() {
        const [show, setShow] = React.useState(true);
        const [update, forceUpdate] = React.useState(1);
  
        React.useEffect(() => {
          const t1 = setTimeout(() => {
            setShow(false);
          }, 1000);
          const t2 = setTimeout(() => {
            console.log('force update')
            forceUpdate(update+1)
          }, 2000);
          return () => {
            clearTimeout(t1)
            clearTimeout(t2)
          }
        }, [setShow, forceUpdate]);
  
        return show ? (
          <div data-testid="test">
            Enabled
            <First />
          </div>
        ) : <div>Disabled</div>;
      }
  
      function App() {
        React.useRef(myContext);

        return (
          <div>
            App
            <ApolloProvider client={client}>
              <Test />
            </ApolloProvider>
          </div>
        );
      }
  
      let app = render(<App />);
      await waitFor(10000);
      app.debug();
      app.unmount();
      app.debug();
      app = undefined;
      myContext = undefined;
      client = undefined;
      pubsub = undefined;
      global.gc();
      await waitFor(3000);
    },
    40 * 1000
  );
})
