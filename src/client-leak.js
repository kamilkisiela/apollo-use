import { gql } from "@apollo/client";
import { PubSub } from "graphql-subscriptions";
import weak from "weak-napi";
import { createClient } from "./client";

describe("memory leak", () => {
  let client;
  let pubsub;

  beforeEach(() => {
    pubsub = new PubSub();
    client = createClient(pubsub);
  });

  afterEach(() => {
    client = undefined;
    pubsub = undefined;
  });

  test(
    "subscription",
    (done) => {
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

      function createSub() {
        let subscription$ = client.subscribe({
          query: gql`
            subscription ping {
              ping
            }
          `,
          context: myContext,
        });
        let subscription = subscription$.subscribe(() => {
          if (subscription) {
            console.log('unsub');
            subscription.unsubscribe();
          }
          subscription$ = undefined;
          subscription = undefined;
          myContext = undefined;
          pubsub = undefined;
          global.gc();
        });
      }

      createSub()
      createSub()
      createSub()
      
      setTimeout(() => {
        pubsub.publish('PING', {
          ping: 'pong'
        })
      }, 3000);
    },
    40 * 1000
  );

  test.skip(
    "query",
    (done) => {
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

      let obs = client.watchQuery({
        query: gql`
          query foo {
            foo
          }
        `,
        context: myContext,
      });
      let subscription = obs.subscribe(() => {});

      if (subscription) {
        subscription.unsubscribe();
      }
      obs = undefined;
      subscription = undefined;
      myContext = undefined;
      pubsub = undefined;
      global.gc();
    },
    40 * 1000
  );
});
