const registerMail = (fname, id, lname, account_type, username) => {
    const subject = "Registration Successfull !"
    const body = `<!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to Task Assigner</title>
      <style>
        body {
          background-color: #f4f4f4;
          font-family: Arial, sans-serif;
          color: #333333;
        }
    
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background-color: #ffffff;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          border-radius: 6px;
        }
    
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
    
        h1 {
          margin-top: 0;
          text-align: center;
        }
    
        p {
          margin-bottom: 20px;
        }
    
        .button {
          display: inline-block;
          background-color: #ff0000;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
        }
    
        .footer {
          margin-top: 30px;
          text-align: center;
        }
    
        .footer p {
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://example.com/logo.png" alt="Task Assigner Logo" width="150">
        </div>
        <h1>Welcome to <strong><span style="color:red">T</span>ask<span style="color:red">S</span>ync!</strong></h1>
        <p>Thank you <strong>${fname}</strong> for registering with <strong><span style="color:red">T</span>ask<span style="color:red">S</span>ync.</strong> We're excited to have you on board.</p>
        <p>To get started, login to your account using the following credentials:</p>
        <p><strong>Username: </strong> ${username}</p>
        <p><strong>Account Type: </strong> ${account_type}</p>
        <p>
          Once logged in, you can start assigning and managing tasks efficiently. If you have any questions or need assistance,
          feel free to reach out to our support team.
        </p>
        <p>Click the button below to access <strong><span style="color:red">T</span>ask<span style="color:red">S</span>ync:</strong></p>
        <p>
          <a href="https://example.com/login" class="button">Login to TaskSync</a>
        </p>
        <div class="footer">
          <p>&copy; 2023 <strong><span style="color:red">T</span>ask<span style="color:red">S</span>ync.</strong> All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `
    return { body, subject }
}

export default registerMail