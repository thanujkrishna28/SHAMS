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

export const getAttendanceEmail = (name: string, type: 'entry' | 'exit' | 'absence', time: string, location: string, status: string) => {
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
export const getHostelCreationEmail = (chiefWardenName: string, hostelName: string, type: string, credentials?: { email: string, password?: string }) => {
    const content = `
        <h2 style="color: #1e293b; margin-top: 0;">New Hostel Management Assignment</h2>
        <p>Dear ${chiefWardenName},</p>
        <p>You have been assigned as the <strong>Chief Warden</strong> for the newly created hostel infrastructure in the Smart HMS ecosystem.</p>
        
        <div class="info-card">
            <div class="info-item">
                <span class="info-label">Hostel Name:</span>
                <span class="info-value">${hostelName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value" style="color: ${type === 'BOYS' ? '#0ea5e9' : '#ec4899'}">${type}</span>
            </div>
        </div>

        ${credentials ? `
        <div class="info-card" style="border-left: 4px solid #4f46e5;">
            <p style="margin: 0 0 10px 0; font-weight: 700; color: #4f46e5; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Your Login Credentials</p>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${credentials.email}</span>
            </div>
            ${credentials.password ? `
            <div class="info-item">
                <span class="info-label">Password:</span>
                <span class="info-value" style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${credentials.password}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <p>You can now log in to the Warden Portal to manage blocks, room allocations, and student attendance for this hostel.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Access Warden Portal</a>
        <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If this is your first time logging in, we recommend changing your password immediately from your profile settings.</p>
    `;
    return getBaseTemplate(content, 'New Hostel Assignment');
};

export const getOTPEmail = (name: string, otp: string) => {
    const content = `
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed. This OTP is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 16px 32px; background-color: #f1f5f9; border: 2px dashed #4f46e5; border-radius: 12px; font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 0.2em;">
                ${otp}
            </div>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 20px;">For security reasons, never share this OTP with anyone.</p>
    `;
    return getBaseTemplate(content, 'Password Reset OTP');
};
