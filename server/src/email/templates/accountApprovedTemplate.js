const accountApprovedTemplate = (name,email) => {
  return `<!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <title>Account Approved - EcoResolve</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f0fdf4;
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
        color: #065f46;
        margin-bottom: 12px;
      }

      .content {
        font-size: 16px;
        color: #374151;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .highlight {
        font-weight: 600;
        color: #065f46;
      }

      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 24px;
        background-color: #10b981;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
      }

      .footer {
        font-size: 14px;
        color: #6b7280;
        margin-top: 25px;
      }

      .footer a {
        color: #10b981;
        text-decoration: none;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <img class="logo" src="https://i.ibb.co/m1d3p9w/output-onlinepngtools.png" alt="EcoResolve Logo" />
      
      <div class="title">Your Account Has Been Approved!</div>
      
      <div class="content">
        <p>Hello ${name},</p>
        <p>Your account with email address ${email} has been successfully verified.</p>
        <p>Great news! Your account on <strong>EcoResolve</strong> has been approved by the admin. You can now log in and start reporting issues in your community.</p>
        
        <a href="https://ecoresolve.com/login" class="button">Login to EcoResolve</a>
      </div>
      
      <div class="footer">
        Need help? Contact us at 
        <a href="mailto:support@ecoresolve.com">support@ecoresolve.com</a>
      </div>
    </div>
  </body>

  </html>`;
};

export default accountApprovedTemplate;
