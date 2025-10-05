const otpTemplate = (otp, name) => {
  return `<!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification - EcoResolve</title>
    <style>
      body {
        background-color: #f0fdf4;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        color: #1f2937;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        text-align: center;
        padding: 30px 25px;
      }

      .logo {
        max-width: 150px;
        margin-bottom: 25px;
      }

      .heading {
        font-size: 22px;
        font-weight: 600;
        color: #065f46;
        margin-bottom: 10px;
      }

      .content {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 20px;
        color: #374151;
      }

      .otp-box {
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 4px;
        background-color: #d1fae5;
        color: #065f46;
        padding: 12px 0;
        width: 200px;
        margin: 20px auto;
        border-radius: 8px;
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
       <h1>Welcome to EcoResolve!</h1>    
       <div class="heading">Verify Your Email</div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thanks for joining <strong>EcoResolve</strong> — the platform where citizens report community issues like potholes, water leakage, and other civic problems, and local authorities work to resolve them.</p>
        <p>Use the OTP below to verify your email address and start reporting problems in your area:</p>
        <div class="otp-box">${otp}</div>
        <p>This OTP is valid for <strong>3 minutes</strong>. If you did not request this, you can safely ignore this message.</p>
      </div>
      <div class="footer">
        Need help? Contact us at <a href="mailto:support@ecoresolve.com">support@ecoresolve.com</a>
      </div>
    </div>
  </body>

  </html>`;
};

export default otpTemplate;
