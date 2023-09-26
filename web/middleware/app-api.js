import express from "express";
import shopify from "../shopify.js";

const SUBSCRIBE_MUTATION = `
  mutation 
    appSubscriptionCreate(
      $name: String!,
      $returnUrl: URL!,
      $amount: Decimal!,
      $trialDays: Int!,
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        trialDays: $trialDays
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: { amount: $amount, currencyCode: USD }
              interval: EVERY_30_DAYS
            }
          }
        }]
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
        }
      }
    }
`;

const CANCEL_SUBSCRIPTION_MUTATION = `
  mutation CancelSubscription($id: ID!) {
    appSubscriptionCancel(
      id: $id
    ) {
      userErrors {
        field
        message
      }
      appSubscription {
        id
        status
      }
    }
  }
`;

export default function applyAppApiEndpoints(app) {
  app.use(express.json());

  app.get("/api/shop", async (req, res) => {
    res.status(200).send(res.locals.shopify.session.shop);
  });

  app.get("/api/session", async (req, res) => {
    res.status(200).send(res.locals.shopify.session);
  });

  app.get("/api/chat-widget-id", async (req, res) => {
    res.status(200).send(process.env.SHOPIFY_CHAT_WIDGET_ID);
  })

  /*
    Expect body to contain
    planName: string
    planPrice: double
    trialDays: integer
    returnUrl: string
  */
  app.post("/api/billing/subscribe", async (req, res) => {
    try {
      const planName = req.body.planName
      const planPrice = req.body.planPrice
      const trialDays = req.body.trialDays

      const shopDomain = res.locals.shopify.session.shop;
      const returnUrl = `https://${shopDomain}/admin/apps/shopmate-3/plan/confirmation`;
      console.log(returnUrl)

      // Send a graphQL request to generate charge
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      });

      const response = await client.query({
        data: {
          query: SUBSCRIBE_MUTATION,
          variables: {
            name: planName,
            returnUrl: returnUrl,
            amount: planPrice,
            trialDays: trialDays,
          },
        },
      });

      // Return the response and URL
      res.status(200).send(response.body.data.appSubscriptionCreate)
      
    } catch (error) {
      console.log(error)
      res.status(500).send(error.message);
    }
  })

  app.post("/api/billing/cancel-subscription", async (req, res) => {
    try {
      const subscriptionId = req.body.subscriptionId

      // Send a graphQL request to cancel the subscription
      const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
      });

      const response = await client.query({
        data: {
          query: CANCEL_SUBSCRIPTION_MUTATION,
          variables: {
              id: subscriptionId,
          },
        },
      });

      res.status(200).send('Subscription Cancelled Sucessfully.')
      
    } catch (error) {
      console.log(error)
      res.status(500).send(error.message);
    }
  })
}