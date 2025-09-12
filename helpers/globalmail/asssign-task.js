const assignTask = (fname, id, title, description, mailfrom) => {
    const subject = "You have been assigned a task"
    const body = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Task Assignment</title>
      <style>
        /* CSS styles for the email template */
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333333;
          margin-top: 0;
        }
        p {
          color: #666666;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #ff0000;
          color: #ffffff;
          text-decoration: none;
          border-radius: 3px;
        }
        .button:hover {
          background-color: #ff0000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Task Assignment</h1>
        <p>Hello ${fname},</p>
        <p>You have been assigned a new task: <strong>${title}</strong>.</p>
        <p>Please review the details of the task and get started.</p>
        <p><strong>Task Id:</strong></p>
        <p>${id}</p>
        <p><strong>Task Description:</strong></p>
        <p>${description}</p>
        <p><a class="button" href="#">View Task</a></p>
        <p>Best regards,</p>
        <p>${mailfrom}</p>
      </div>
    </body>
    </html>
    `
    return { body, subject }
}

export default assignTask