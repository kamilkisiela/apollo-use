import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { ApolloProvider, gql, useQuery, useSubscription } from "@apollo/client";
import weak from "weak-napi";
import { client } from "./client";

function waitFor(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

test(
  "memory leak - subscription",
  async (done) => {
    class MyContext {
      foo = "bar";
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

      React.useEffect(() => {
        setTimeout(() => {
          setShow(false);
        }, 1000);
      }, []);

      return show ? (
        <div data-testid="test">
          <First />
        </div>
      ) : null;
    }

    function App() {
      return (
        <ApolloProvider client={client}>
          <Test />
        </ApolloProvider>
      );
    }

    const app = render(<App />);
    await waitForElementToBeRemoved(() => screen.getByTestId("test"));
    await waitFor(3000);
    app.unmount();
    myContext = undefined;
    await waitFor(3000);
  },
  40 * 1000
);

test(
  "memory leak - query",
  async (done) => {
    class MyContext {
      foo = "bar";
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

      React.useEffect(() => {
        setTimeout(() => {
          setShow(false);
        }, 1000);
      }, []);

      return show ? (
        <div data-testid="test">
          <First />
        </div>
      ) : null;
    }

    function App() {
      return (
        <ApolloProvider client={client}>
          <Test />
        </ApolloProvider>
      );
    }

    const app = render(<App />);
    await waitForElementToBeRemoved(() => screen.getByTestId("test"));
    await waitFor(3000);
    app.unmount();
    myContext = undefined;
    await waitFor(3000);
  },
  40 * 1000
);
