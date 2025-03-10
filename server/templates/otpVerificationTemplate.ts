export const otpVerificationTemplate = (otp: string) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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

        .otp {
            font-size: 24px;
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
            <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
            <p class="message">
                Thank you for registering with our service. To complete the registration process and verify your email
                address, please use the One-Time Password (OTP) below:
            </p>
            <p class="otp">
                ${otp}
            </p>
            <p class="instructions">
                Please enter this OTP in the application to verify your email address. The OTP is valid for 5 minutes.
                If you didn't request this, please ignore this email.
            </p>
            <p class="footer">
                If you need assistance, feel free to contact us at <a
                    href="mailto:maticui@gmail.com">maticui@gmail.com</a>.
            </p>
        </div>
    </div>
</body>

</html>s
`
}