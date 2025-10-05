const passwordUpdated = (email, url) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8" />
    <title>Password Updated - LearnSpark</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1f2937;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
        padding: 30px;
        text-align: center;
      }

      .logo {
        max-width: 140px;
        margin-bottom: 20px;
      }

      .title {
        font-size: 22px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 12px;
      }

      .content {
        font-size: 16px;
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .highlight {
        font-weight: 600;
        color: #111827;
      }

      .footer {
        font-size: 14px;
        color: #6b7280;
        margin-top: 25px;
      }

      .footer a {
        color: #3b82f6;
        text-decoration: none;
      }

      .alert {
        background-color: #fef3c7;
        color: #b45309;
        padding: 12px 20px;
        border-radius: 8px;
        margin: 20px auto;
        font-weight: 500;
      }

      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 24px;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
      }
    </style>
  </head>
  
  <body>
    <div class="container">
      <a href="https://ibb.co/VYBQYvcQ">
        <img src="https://i.ibb.co/d4KL4QwL/Screenshot-2025-06-20-231953.png" alt="LearnSpark Logo" class="logo" />
      </a>
      
      <div class="title">Password Successfully Updated</div>
      
      <div class="content">
        <p>Hi there,</p>
        <p>This is a confirmation that the password for your account associated with <span class="highlight">${email}</span> has been changed successfully.</p>
        
        <div class="alert">
          If you did not request this change, please contact our support team immediately.
        </div>

        <a href="${url}" class="button">Login to LearnSpark</a>
      </div>
      
      <div class="footer">
        Need help? Contact us at 
        <a href="mailto:support@learnspark.in">support@learnspark.in</a>
      </div>
    </div>
  </body>
  
  </html>`;
};

export default passwordUpdated;
// This template is designed to be used in an email notification system