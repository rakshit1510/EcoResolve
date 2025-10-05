const otpTemplate = (otp, name) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification - LearnSpark</title>
    <style>
      body {
        background-color: #f9fafb;
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
        color: #111827;
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
        background-color: #fef3c7;
        color: #b45309;
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
        color: #3b82f6;
        text-decoration: none;
      }
    </style>
  </head>
  
  <body>
    <div class="container">
       <a href="https://ibb.co/VYBQYvcQ"><img src="https://i.ibb.co/d4KL4QwL/Screenshot-2025-06-20-231953.png" alt="Screenshot-2025-06-20-231953" border="0"></a>
         <h1>Welcome to LearnSpark!</h1>    
       <div class="heading">Verify Your Email</div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thanks for joining <strong>LearnSpark</strong>! Use the OTP below to verify your email address and activate your account:</p>
        <div class="otp-box">${otp}</div>
        <p>This OTP is valid for <strong>3 minutes</strong>. If you did not request this, you can safely ignore this message.</p>
      </div>
      <div class="footer">
        Need help? Contact us at <a href="mailto:gadeaniruddha2@gmail.com">gadeaniruddha2@gmail.com</a>
      </div>
    </div>
  </body>
  
  </html>`;
};

export default otpTemplate;
// This template is designed to be used in an email verification context, providing a clean and professional look while ensuring the user has all necessary information to verify their account. The OTP is prominently displayed for easy visibility.
