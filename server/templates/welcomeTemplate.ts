import dotenv from "dotenv"

dotenv.config()

interface IWelcome {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
}

export const welcomeTemplate = ({ firstName, lastName, email, password }: IWelcome) => {
    return `
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Your Clinic Management System</title>
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

            .button {
                display: inline-block;
                font-weight: bold;
            }

            .questions {
                margin-top: 20px;
                font-size: 16px;
            }

            .link {
                color: #4F46E5;
                text-decoration: none;
            }

            .regards {
                font-size: 16px;
                margin-top: 20px;
            }

            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #777;
            }

            .socialIcons {
                margin: 10px 0;
            }

            .icon {
                width: 30px;
                margin: 0 5px;
            }

            .footerText {
                margin: 10px 0;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Your Clinic Management System</h1>
            </div>
            <div class="content">
                <p class="greeting">
                    Dear ${firstName} ${lastName},
                </p>
                <p class="message">
                    Thank you for choosing our Clinic Management System software. We are excited to help you
                    streamline your clinic's operations, from patient management to appointment scheduling,
                    billing, and much more.
                </p>
                <p class="message">
                    Your account has been successfully created. Here are your login details:
                </p>
                <p class="message">
                    <strong>Email:</strong> ${email} <br />
                    <strong>Password:</strong> ${password}
                </p>
                <a href="${process.env.FRONTEND_URL}/login" class="button">Log In to Your Dashboard</a>
                <p class="message">
                    Our system includes features like patient records, appointment scheduling, invoicing, and more,
                    all designed to simplify your clinic's operations and improve patient care.
                </p>
                <p class="questions">
                    Got questions? <br />
                    Reach out to us anytime at <a href="mailto:maticui@gmail.com" class="link">maticui@gmail.com</a>
                </p>
                <p class="regards">Regards, <br /> Matic UI Clinic Management Team</p>
            </div>
        </div>
    </body>

</html>`
}