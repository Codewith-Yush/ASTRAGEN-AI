import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(200),
  subject: z.string().trim().max(200).optional().default('New Contact Form Submission'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000, 'Message is too long'),
});

// Helper to escape HTML characters
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    // Rate limit check by client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';

    const rateLimit = checkRateLimit(`contact_${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many contact submissions. Please wait before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfterSeconds.toString() },
        }
      );
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Hardcoded destination to prevent open mail relay abuse
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER;

    if (!receiverEmail) {
      console.warn('CONTACT_RECEIVER_EMAIL is not configured.');
      return NextResponse.json(
        { message: 'Contact service is temporarily unconfigured. Please try again later.' },
        { status: 503 }
      );
    }

    // Sanitize headers to prevent header injection
    const sanitizedSubject = subject.replace(/[\r\n]+/g, ' ');
    const sanitizedEmail = email.replace(/[\r\n]+/g, '');

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const safeName = escapeHTML(name);
    const safeEmail = escapeHTML(sanitizedEmail);
    const safeSubject = escapeHTML(sanitizedSubject);
    const safeMessage = escapeHTML(message);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@astragen.ai',
      to: receiverEmail,
      replyTo: sanitizedEmail,
      subject: `[Contact Form] ${sanitizedSubject}`,
      text: `Name: ${name}\nEmail: ${sanitizedEmail}\nSubject: ${sanitizedSubject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;">
          <div style="margin-top: 16px;">
            <strong style="color: #334155;">Message:</strong>
            <p style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 6px; color: #1e293b;">${safeMessage}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending contact email:', error?.message || error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
