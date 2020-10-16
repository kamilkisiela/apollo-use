import {
  ApolloClient,
  ApolloLink,
  Observable,
  InMemoryCache,
} from "@apollo/client";
import { PubSub } from "graphql-subscriptions";
import { graphqlLink } from "./link";

const pubsub = new PubSub();

const schemaLink = graphqlLink(
  /* GraphQL */ `
    type Query {
      foo: String
    }
    type Subscription {
      ping: String
    }
  `,
  {
    Query: {
      foo: () => "bar",
    },
    Subscription: {
      ping: {
        subscribe: () => {
          console.log("ping");
          return pubsub.asyncIterator(["PING"]);
        },
      },
    },
  }
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    new ApolloLink((op, next) => {
      return new Observable((observer) => {
        const sub = next(op).subscribe(observer);
        return () => {
          sub.unsubscribe();
        };
      });
    }),
    schemaLink,
  ]),
});