import { Banner } from "@shopify/polaris";

export default function SubscriptionStatusBanner({
  firstInstallDate, 
  subscriptionStatus,
  subscriptionStartDate,
  subscriptionEndDate,
  allowedMessages,
  messagesThisBillingPeriod,
}) {
  const gracePeriod = 1 // 1 day grace period

  const currentDate = new Date();
  const endOfTrialDate = new Date(firstInstallDate);
  endOfTrialDate.setDate(endOfTrialDate.getDate() + 14); // 14-day free trial
  const daysLeftInTrial = Math.ceil((endOfTrialDate - currentDate) / (1000 * 60 * 60 * 24));

  const endSubscriptionDate = subscriptionEndDate ? new Date(subscriptionEndDate) : new Date()
  const daysLeftInSubscription = Math.ceil((endSubscriptionDate - currentDate) / (1000 * 60 * 60 * 24) + gracePeriod);
  console.log(daysLeftInSubscription)

  if (subscriptionStatus === "trial") {
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
  }

  if (subscriptionStatus === "active") {
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

  if (subscriptionStatus === "cancelled") {
    if (messagesThisBillingPeriod > allowedMessages) {
      return (
        <Banner
          title="Your subscription is cancelled and you have exceeded your message cap."
          status="critical"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Your shopping assistant will not be active. Upgrade now to continue using the service.</p>
        </Banner>
      );
    }
    if (daysLeftInSubscription > 0) {
      return (
        <Banner
          title={`Your subscription is cancelled. You have ${daysLeftInSubscription} days left until the service stops.`}
          status="warning"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Upgrade to continue using the service after your current subscription period.</p>
        </Banner>
      );
    } else {
      return (
        <Banner
          title="Your subscription has expired and has no days remaining."
          status="critical"
          action={{ content: 'Upgrade Now', url: '/plan' }}
        >
          <p>Upgrade to continue using the service.</p>
        </Banner>
      );
    }
  }

  if (subscriptionStatus === "expired") {
    return (
      <Banner
        title="Your subscription has expired and has no days remaining."
        status="critical"
        action={{ content: 'Upgrade Now', url: '/plan' }}
      >
        <p>Upgrade to continue using the service.</p>
      </Banner>
    );
  }

  // In cases where none of the conditions are met, return null.
  return null;
}
