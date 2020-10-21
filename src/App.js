import {
  ApolloProvider,
  gql,
  useQuery,
} from "@apollo/client";
import React, { useEffect, useState } from "react"
import { client } from "./client";

class MyContext {
  dummy = "=====";
}

const Sample = () => {
  // const [skip, setSkip] = useState(false);

  useQuery(
    gql`
      query foo {
        foo
      }
    `,
    {
      skip: true,
      context: {
        my: new MyContext(),
      },
    }
  );

  return <div>asdasd</div>;
};

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
