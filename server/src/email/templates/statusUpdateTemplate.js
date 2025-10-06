const statusUpdateTemplate = (name, complaintId, status) => {
  // change this to your actual frontend domain
  const complaintUrl = `https://localhost:8000/api/complaints/${complaintId}`;

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Complaint Status Update - EcoResolve</title>
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
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .highlight-link {
        font-weight: 600;
        color: #065f46;
        text-decoration: none;
      }
      .highlight-link:hover {
        text-decoration: underline;
      }
      .status-box {
        background-color: #d1fae5;
        color: #065f46;
        padding: 12px 20px;
        border-radius: 8px;
        margin: 20px auto;
        font-weight: 500;
        display: inline-block;
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
      <div class="title">Complaint Status Updated</div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Your complaint with ID 
          <a href="${complaintUrl}" class="highlight-link">${complaintId}</a> 
          has a new status:</p>
        <div class="status-box">${status.toUpperCase()}</div>
        <p>Thank you for helping improve our community! 🌱</p>
      </div>
      <div class="footer">
        Need help? Contact us at 
        <a href="mailto:support@ecoresolve.com">support@ecoresolve.com</a>
      </div>
    </div>
  </body>
  </html>`;
};

export default statusUpdateTemplate;
