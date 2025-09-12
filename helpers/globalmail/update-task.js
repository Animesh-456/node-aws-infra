const updateTask = (fname, id, title, description) => {
  const subject = "Your Task has been modified by the Assigner"
  const body = `<!DOCTYPE html>
<html>
<head>
  <title><span style="color:red">T</span>askSync Update</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
    }

    h1, h3 {
      color: #333;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .message {
      margin-top: 20px;
    }

    .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #ff0000;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        text-decoration: none;
    }

    .button:hover {
        background-color: #cc0000;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1><span style="color:red">T</span>ask<span style="color:red">S</span>ync Update</h1>
    <h3>Hello, ${fname}</h3>
    <h3>Your task has been updated successfully.</h3>
    <h3>Details of the task:</h3>
    <ul>
    <li><strong>Id : </strong>${id}</li>
      <li><strong>Title : </strong>${title}</li>
      <li><strong>Description : </strong>${description}</li>
    </ul>
    <h3 class="message">Thank you for using TaskSync.</h3>
    <a href="#" class="button">Visit Website</a>
  </div>
</body>
</html>`
  return { body, subject }
}

export default updateTask