const prisma = require('../config/prisma');

class NotificationService {
  async getLogs({ channel, event_type }) {
    const where = {};
    if (channel) where.channel = channel;
    if (event_type) where.event_type = event_type;

    return await prisma.notifications_log.findMany({
      where,
      orderBy: [{ sent_at: 'desc' }],
      take: 100
    });
  }

  async sendNotification({ recipient_name, recipient_phone, event_type, channel = 'SMS', message }) {
    if (!recipient_phone || !message) {
      throw { status: 400, message: 'Phone and Message are required' };
    }

    // Real-life hook: In production this calls Twilio / SSL Wireless / BulkSMS API
    // Here we simulate instant carrier delivery and log it persistently
    return await prisma.notifications_log.create({
      data: {
        recipient_name: recipient_name || 'Patient',
        recipient_phone,
        event_type,
        channel,
        message,
        status: 'Delivered',
        gateway_response: '200 OK (Carrier Delivered)'
      }
    });
  }
}

module.exports = new NotificationService();

