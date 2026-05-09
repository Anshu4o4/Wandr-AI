import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const isMockMode = 
  !stripeSecret || 
  stripeSecret.includes('your_stripe') || 
  stripeSecret.includes('dummy') || 
  (!stripeSecret.startsWith('sk_test_') && !stripeSecret.startsWith('sk_live_'));

if (isMockMode) {
  console.log('⚠️  STRIPE: Running in MOCK mode due to missing or placeholder API key.');
}

const stripe = new Stripe(stripeSecret);

/**
 * Create a payment intent
 * Returns mock data if no valid Stripe key is present
 */
export const createPaymentIntent = async (amount, metadata = {}) => {
  if (isMockMode) {
    return {
      id: 'mock_pi_' + Date.now(),
      client_secret: 'mock_secret_' + Date.now(),
      status: 'succeeded'
    };
  }
  
  try {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: 'usd',
      metadata,
    });
  } catch (error) {
    throw new Error(`Stripe Payment Intent Creation Failed: ${error.message}`);
  }
};

/**
 * Refund a payment intent
 */
export const refundPayment = async (paymentIntentId) => {
  if (isMockMode || (paymentIntentId && paymentIntentId.startsWith('mock_'))) {
    return {
      id: 'mock_re_' + Date.now(),
      status: 'succeeded'
    };
  }

  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  } catch (error) {
    throw new Error(`Stripe Refund Failed: ${error.message}`);
  }
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhook = (payload, signature) => {
  if (isMockMode) {
    return { 
      type: 'payment_intent.succeeded', 
      data: { object: { id: 'mock_pi_webhook' } } 
    };
  }
  
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

export default stripe;
