import { Banner } from "@shopify/polaris";

export default function SubscriptionStatusBanner({
  firstInstallDate, 
  subscriptionId,
  subscriptionStatus,
  subscriptionStartDate,
  subscriptionEndDate,
  allowedMessages,
  messagesThisBillingPeriod,
}) {
  const gracePeriod = 0 // 0 day grace period

  const currentDate = new Date();
  const endOfTrialDate = new Date(firstInstallDate);
  endOfTrialDate.setDate(endOfTrialDate.getDate() + 7); // 7-day free trial
  const daysLeftInTrial = Math.ceil((endOfTrialDate - currentDate) / (1000 * 60 * 60 * 24));

  const endSubscriptionDate = subscriptionEndDate ? new Date(subscriptionEndDate) : new Date()
  const daysLeftInSubscription = Math.ceil((endSubscriptionDate - currentDate) / (1000 * 60 * 60 * 24) + gracePeriod);

  if (subscriptionId === 0) {
    if (subscriptionStatus === 'FROZEN') {
      return (
        <Banner
          title="Your subscription has expired and has no days remaining."
          status="critical"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Select a plan to continue using the service.</p>
        </Banner>
      );
    }

    if (daysLeftInTrial <= 0) {
      return (
        <Banner
          title="Your free trial has ended."
          status="warning"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Upgrade to continue using the service.</p>
        </Banner>
      );
    }
    if (messagesThisBillingPeriod > allowedMessages) {
      return (
        <Banner
          title="You have exceeded the number of messages allowed in your free trial."
          status="critical"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Your shopping assistant will not be active. Upgrade now to continue uninterrupted service.</p>
        </Banner>
      );
    } 
    if (messagesThisBillingPeriod > allowedMessages * 0.8) {
      return (
        <Banner
          title="You've used more than 80% of messages allowed in your free trial."
          status="warning"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Consider upgrading or increasing your message cap to continue uninterrupted service.</p>
        </Banner>
      );
    } else {
      return (
        <Banner
          title={`You are on a free trial with ${daysLeftInTrial} days left.`}
          status="info"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Upgrade to continue using the service after the trial period.</p>
        </Banner>
      );
    }
  } else {
    if (messagesThisBillingPeriod > allowedMessages) {
      return (
        <Banner
          title="You have exceeded your message cap for this billing period."
          status="critical"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Your shopping assistant will not be active. Upgrade now to increase your message cap.</p>
        </Banner>
      );
    }
    if (messagesThisBillingPeriod > allowedMessages * 0.8) {
      return (
        <Banner
          title="You've used more than 80% of your messages this month."
          status="warning"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Consider upgrading or increasing your message cap to continue uninterrupted service.</p>
        </Banner>
      );
    }
  }

  // In cases where none of the conditions are met, return null.
  return null;
}
