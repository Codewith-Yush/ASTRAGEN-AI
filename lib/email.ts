// lib/email.ts
import nodemailer from 'nodemailer';

interface EmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendEmail({ 
  name, 
  email, 
  subject, 
  message 
}: EmailParams): Promise<nodemailer.SentMessageInfo> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Your app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: 'ayushbro2005@gmail.com', // Hardcoded recipient
    replyTo: email, // Allow replying directly to the sender
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4338ca;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}