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
        test: true
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

export default function applyAppApiEndpoints(app) {
    app.use(express.json());

    app.get("/api/shop", async (req, res) => {
      res.status(200).send(res.locals.shopify.session.shop);
    });

    app.get("/api/session", async (req, res) => {
      res.status(200).send(res.locals.shopify.session);
    });

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
        const relativeUrl = req.body.relativeUrl

        const shopDomain = res.locals.shopify.session.shop;
        const returnUrl = `https://${shopDomain}/admin/apps/chat-reccomendation-app-1/plan/confirmation`;
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

    /*
      Add cancellation api endpoint
    */

    app.get("/api/billing/payment-confirmation", async (req, res) => {
      try {
        const charge_id = req.query.charge_id
        console.log(`charge_id: ${charge_id}`)
        // Query graphQL to get the subsciption details:

        // Make a POST request to database

        // await a good response
        res.redirect('https://ceepul-dev-store.myshopify.com/admin/apps/chat-reccomendation-app-1/plan/settings');
      } catch (error) {
        // Make a log of the error with shop, subscription ID, and date/time, error message
        // Invalid subscription ID?

        // Retry the database update after a delay x times

        // Send email to myself with same data as the log

        // Email the customer?
      }
      
      
    })

    app.get("/api/billing/subscription-data/:chargeId", async (req, res) => {
      try {
        const charge_id = req.params.chargeId
        console.log(`charge_id: ${charge_id}`)

        const client = new shopify.api.clients.Graphql({
          session: res.locals.shopify.session,
        });

        const APP_SUBSCRIPTION_QUERY = `
          query 
          {
            appInstallation {
              activeSubscriptions {
                createdAt
                currentPeriodEnd
                id
                name
                lineItems {
                  id
                }
                returnUrl
                status
                trialDays
                test
              }
            }
          }
        `;

        const response = await client.query({
          data: {
            query: APP_SUBSCRIPTION_QUERY,
          },
        });

        console.log(response.body.data.appInstallation.activeSubscriptions)

        res.status(200).send(response.body.data.appInstallation.activeSubscriptions);

      } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
      }
    })
}