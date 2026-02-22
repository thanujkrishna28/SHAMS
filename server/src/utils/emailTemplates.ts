export const getBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
        }
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .info-label {
            color: #64748b;
            font-weight: 500;
        }
        .info-value {
            color: #1e293b;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Smart HMS</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Smart Hostel Management System. All rights reserved.<br>
            Managed by University Administration
        </div>
    </div>
</body>
</html>
`;

export const getWelcomeEmail = (name: string) => {
    const content = `
        <h2 style="color: #1e293b; margin-top: 0;">Welcome to Smart HMS, ${name}!</h2>
        <p>Your student account has been successfully created. We are excited to have you as part of our smart hostel ecosystem.</p>
        <div class="info-card">
            <p style="margin: 0; font-weight: 600; color: #4f46e5;">Next Steps:</p>
            <ul style="margin-bottom: 0; padding-left: 20px; font-size: 14px;">
                <li>Complete your profile details</li>
                <li>Upload required verification documents</li>
                <li>Apply for room allocation</li>
            </ul>
        </div>
        <p>Login to your dashboard to access all hostel services, including attendance tracking, mess management, and complaints.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Go to Dashboard</a>
    `;
    return getBaseTemplate(content, 'Welcome to Smart HMS');
};

export const getAttendanceEmail = (name: string, type: 'entry' | 'exit', time: string, location: string, status: string) => {
    const isEntry = type === 'entry';
    const content = `
        <h2 style="color: #1e293b; margin-top: 0;">Movement Detected</h2>
        <p>Hello ${name}, a new ${type} log has been recorded for your account.</p>
        <div class="info-card">
            <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value" style="color: ${isEntry ? '#10b981' : '#f59e0b'}">${type.toUpperCase()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">${location}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Time:</span>
                <span class="info-value">${time}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Current Status:</span>
                <span class="info-value">${status}</span>
            </div>
        </div>
        <p style="font-size: 13px; color: #64748b;">If this wasn't you, please contact the security office immediately.</p>
    `;
    return getBaseTemplate(content, `Attendance ${type.toUpperCase()}`);
};
