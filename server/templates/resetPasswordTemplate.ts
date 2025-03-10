export const resetPasswordTemplate = (resetLink: string) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: "Arial, sans-serif";
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #4F46E5;
            color: white;
            text-align: center;
            padding: 30px 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            text-align: center;
            color: #333;
        }

        .greeting {
            font-size: 18px;
            font-weight: bold;
        }

        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-top: 10px;
        }

        .reset-link {
            font-size: 16px;
            font-weight: bold;
            color: #4F46E5;
            margin-top: 20px;
        }

        .instructions {
            font-size: 16px;
            margin-top: 20px;
        }

        .footer {
            font-size: 14px;
            text-align: center;
            margin-top: 40px;
            color: #888;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p class="message">
                We received a request to reset your password. If you requested this, please click the link below to
                reset your password:
            </p>
            <p class="reset-link">
                <a href="${resetLink}" target="_blank">Reset Your Password</a>
            </p>
            <p class="instructions">
                If you did not request a password reset, please ignore this email. The link will expire in 10 minutes.
            </p>
            <p class="footer">
                If you need assistance, feel free to contact us at <a
                    href="mailto:maticui@gmail.com.com">maticui@gmail.com.com</a>.
            </p>
        </div>
    </div>
</body>

</html>`
}