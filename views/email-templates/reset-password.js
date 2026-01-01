export const resetPasswordEmail = ({ name, resetLink, otp }) => {
return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <h2 style="color: #d87093;">Reset Your Password</h2>

    <p>Hello ${name || "there"},</p>

    <p>
        We received a request to reset your password for your
        <strong>Her Cycle Bloom</strong> account.
    </p>

    ${
    otp
    ? `<p style="font-size: 16px;">
        <strong>Your One-Time Password (OTP):</strong>
        <span style="letter-spacing: 2px;">${otp}</span>
    </p>`
    : ""
    }

    <p>
        Click the button below to reset your password:
    </p>

    <a href="${resetLink}" style="
           display: inline-block;
           background-color: #d87093;
           color: #ffffff;
           padding: 12px 20px;
           text-decoration: none;
           border-radius: 6px;
           font-weight: bold;
         ">
        Reset Password
    </a>

    <p style="margin-top: 20px;">
        This link will expire in <strong>10 minutes</strong>.
    </p>

    <p style="color: #666; font-size: 14px;">
        If you did not request this password reset, please ignore this email.
        Your password will remain unchanged.
    </p>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Her Cycle Bloom. All rights reserved.
    </p>
</div>
`;
};
