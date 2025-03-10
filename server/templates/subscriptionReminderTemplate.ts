interface SubscriptionReminder {
    firstName: string
    lastName: string
    days: number
}

export const subscriptionReminderTemplate = ({ firstName, lastName, days }: SubscriptionReminder) => {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Expiry Reminder</title>
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
            <h1>Subscription Expiry Reminder</h1>
        </div>
        <div class="content">
            <p class="message">
                Dear ${firstName} ${lastName},<br><br>
                Your clinic subscription will expire in <b>${days}</b> days. Please contact us to renew
                your
                subscription
                and avoid any service interruptions.<br><br>
                Thank you for your cooperation.
            </p>

            <p class="instructions">
                If you need assistance or have any questions, feel free to reach out to us at <a
                    href="mailto:maticui@gmail.com">maticui@gmail.com</a>.
            </p>

            <p class="footer">
                MaticUI Team
            </p>
        </div>
    </div>
</body>

</html>`
}