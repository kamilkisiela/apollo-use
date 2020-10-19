import {
  ApolloProvider,
  gql,
  useSubscription,
  // useQuery,
} from "@apollo/client";
import React, { useEffect, useState } from "react"
import { client } from "./client";

class MyContext {
  dummy = "=====";
}

const Sample = () => {
  // useQuery(
  //   gql`
  //     query foo {
  //       foo
  //     }
  //   `,
  //   {
  //     context: {
  //       my: new MyContext(),
  //     },
  //   }
  // );
  useSubscription(
    gql`
      subscription ping {
        ping
      }
    `,
    {
      context: {
        my: new MyContext(),
      },
    }
  );

  return <Inner />;
};

function Inner() {
  // useQuery(
  //   gql`
  //     query foo {
  //       foo
  //     }
  //   `,
  //   {
  //     context: {
  //       my: new MyContext(),
  //     },
  //   }
  // );
  useSubscription(
    gql`
      subscription ping {
        ping
      }
    `,
    {
      context: {
        my: new MyContext(),
      },
    }
  );

  return null;
}

export const Test = () => {
  const [show, setShow] = useState(true);
  const [, forceUpdate] = useState("a");

  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      forceUpdate('b');
    }, 3000);
  }, []);

  return show ? <Sample /> : null;
};

export const App = () => {
  return (
    <ApolloProvider client={client}>
      <Test />
    </ApolloProvider>
  );
};
