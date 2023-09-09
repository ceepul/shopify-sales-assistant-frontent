import { DeliveryMethod } from "@shopify/shopify-api";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
  },

  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
  },

  PRODUCTS_CREATE: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
  },

  PRODUCTS_DELETE: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
  },

  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
  },

  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.EventBridge,
    arn: 'arn:aws:events:us-east-1::event-source/aws.partner/shopify.com/48101949441/shopify-recommendation-app'
  },
};