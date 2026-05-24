const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
async function sendEmail(to, subject, message) {
  try {
    const mailOptions = {
      from: `"RTI Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: getEmailTemplate(subject, message)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

// Send SMS notification (commented out - optional)
async function sendSMS(to, message) {
  // SMS functionality is optional
  console.log(`SMS to ${to}: ${message}`);
  return true;
}

// Main notification function
async function sendNotification(to, subject, message, options = {}) {
  const { email = true, sms = false, phone } = options;
  
  const results = {
    email: false,
    sms: false
  };

  if (email) {
    results.email = await sendEmail(to, subject, message);
  }

  if (sms && phone) {
    results.sms = await sendSMS(phone, `${subject}: ${message}`);
  }

  return results;
}

// Send bulk notifications
async function sendBulkNotifications(recipients, subject, message) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendNotification(
      recipient.email,
      subject,
      message,
      { phone: recipient.phone }
    );
    results.push({ recipient: recipient.email, ...result });
  }

  return results;
}

// Email template
function getEmailTemplate(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          background: #ffffff;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .message {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .button:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RTI Connect</h1>
          <p>Right to Information Management System</p>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <div class="message">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
              Visit RTI Connect
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated message from RTI Connect. Please do not reply to this email.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RTI Connect. All rights reserved.</p>
          <p>
            This is a system generated email. For any queries, please contact support.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send deadline reminder
async function sendDeadlineReminder(user, request) {
  const daysLeft = Math.ceil((request.deadline - new Date()) / (1000 * 60 * 60 * 24));
  
  const subject = `Reminder: RTI Request ${request.requestId} Deadline Approaching`;
  const message = `
    Dear ${user.name},
    
    This is a reminder that the deadline for your RTI request ${request.requestId} is approaching.
    
    Request Details:
    - Request ID: ${request.requestId}
    - Subject: ${request.subject}
    - Department: ${request.department}
    - Deadline: ${request.deadline.toLocaleDateString()}
    - Days Remaining: ${daysLeft}
    
    Please check the status of your request.
    
    Thank you,
    RTI Connect Team
  `;

  return await sendNotification(user.email, subject, message);
}

// Send response notification
async function sendResponseNotification(user, request) {
  const subject = `Response Received for RTI Request ${request.requestId}`;
  const message = `
    Dear ${user.name},
    
    A response has been uploaded for your RTI request ${request.requestId}.
    
    Request Details:
    - Request ID: ${request.requestId}
    - Subject: ${request.subject}
    - Department: ${request.department}
    - Response Date: ${new Date().toLocaleDateString()}
    
    Please login to view the complete response and download any attached documents.
    
    Thank you,
    RTI Connect Team
  `;

  return await sendNotification(user.email, subject, message);
}

module.exports = {
  sendNotification,
  sendBulkNotifications,
  sendDeadlineReminder,
  sendResponseNotification,
  sendEmail,
  sendSMS
};