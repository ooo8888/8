/**
 * BTCPay Server integration for EXITLINK OMEGA
 * Handles cryptocurrency payment processing
 */

const axios = require('axios');
const config = require('../config');

// BTCPay Server API client
const btcpayClient = axios.create({
  baseURL: config.btcpay.url,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `token ${config.btcpay.apiKey}`
  }
});

/**
 * Create a new invoice in BTCPay Server
 * @param {string} amount - Amount in USD
 * @param {string} currency - Currency code (BTC, ETH, LTC, etc.)
 * @param {string} orderId - Order ID for reference
 * @param {string} buyerEmail - Buyer's email (optional)
 * @returns {Promise<object>} - Invoice details
 */
async function createInvoice(amount, currency, orderId, buyerEmail = '') {
  try {
    const response = await btcpayClient.post('/api/v1/stores/' + config.btcpay.storeId + '/invoices', {
      amount,
      currency: 'USD',
      settlementCurrency: currency,
      orderId,
      metadata: {
        buyerEmail,
        orderId
      },
      checkout: {
        redirectURL: `${config.app.url}/payment/success?id=${orderId}`,
        redirectAutomatically: true,
        expirationMinutes: 60,
        monitoringMinutes: 60,
        speedPolicy: 'MediumSpeed',
        paymentMethods: [currency]
      }
    });

    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.settlementCurrency,
      address: response.data.addresses[currency],
      expiresAt: response.data.expirationTime,
      status: response.data.status,
      checkoutUrl: response.data.checkoutLink
    };
  } catch (error) {
    console.error('Error creating BTCPay invoice:', error.response?.data || error.message);
    throw new Error('Failed to create payment invoice');
  }
}

/**
 * Get invoice details from BTCPay Server
 * @param {string} invoiceId - BTCPay invoice ID
 * @returns {Promise<object>} - Invoice details
 */
async function getInvoice(invoiceId) {
  try {
    const response = await btcpayClient.get('/api/v1/stores/' + config.btcpay.storeId + '/invoices/' + invoiceId);
    
    return {
      id: response.data.id,
      status: response.data.status.toLowerCase(),
      amount: response.data.amount,
      currency: response.data.settlementCurrency,
      createdAt: response.data.createdTime,
      expiresAt: response.data.expirationTime,
      completedAt: response.data.monitoringTime,
      metadata: response.data.metadata
    };
  } catch (error) {
    console.error('Error getting BTCPay invoice:', error.response?.data || error.message);
    throw new Error('Failed to get payment details');
  }
}

/**
 * Mark an invoice as paid (for testing)
 * @param {string} invoiceId - BTCPay invoice ID
 * @returns {Promise<object>} - Updated invoice details
 */
async function markInvoiceAsPaid(invoiceId) {
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    throw new Error('This function is only available in development and test environments');
  }

  try {
    const response = await btcpayClient.post('/api/v1/stores/' + config.btcpay.storeId + '/invoices/' + invoiceId + '/mark-paid');
    
    return {
      id: response.data.id,
      status: 'completed',
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error marking BTCPay invoice as paid:', error.response?.data || error.message);
    throw new Error('Failed to mark payment as paid');
  }
}

module.exports = {
  createInvoice,
  getInvoice,
  markInvoiceAsPaid
};