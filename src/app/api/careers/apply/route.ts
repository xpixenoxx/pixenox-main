import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = ((formData.get('name') as string) || '').trim();
    const email = ((formData.get('email') as string) || '').trim();
    const phone = ((formData.get('phone') as string) || '').trim();
    const location = ((formData.get('location') as string) || '').trim();
    const company = ((formData.get('company') as string) || '').trim();
    const linkedin = ((formData.get('linkedin') as string) || '').trim();
    const portfolio = ((formData.get('portfolio') as string) || '').trim();
    const otherUrl = ((formData.get('otherUrl') as string) || '').trim();
    const jobTitle = ((formData.get('jobTitle') as string) || 'Position').trim();
    const department = ((formData.get('department') as string) || 'Engineering').trim();
    const resumeFile = formData.get('resume') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!resumeFile || !(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: 'Please attach your Resume/CV file.' }, { status: 400 });
    }

    // Limit file size to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (resumeFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Resume file size must be less than 15MB.' }, { status: 400 });
    }

    // Process & save resume file
    const originalName = resumeFile.name || 'resume.pdf';
    const ext = path.extname(originalName).replace(/^\./, '') || 'pdf';
    const safeBaseName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'candidate';
    const uniqueFileName = `${safeBaseName}-${Date.now()}.${ext}`;
    const fileSizeFormatted = `${(resumeFile.size / 1024).toFixed(1)} KB`;

    let resumeUrl = `/uploads/resumes/${uniqueFileName}`;

    try {
      const fileBytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(fileBytes);

      // Save locally to public/uploads/resumes
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      await fs.promises.writeFile(path.join(uploadsDir, uniqueFileName), buffer);

      // Attempt Supabase storage upload if bucket is available
      if (supabaseAdmin?.storage) {
        try {
          const { data, error: storageErr } = await supabaseAdmin.storage
            .from('resumes')
            .upload(uniqueFileName, buffer, {
              contentType: resumeFile.type || 'application/pdf',
              upsert: true,
            });

          if (!storageErr && data) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('resumes')
              .getPublicUrl(uniqueFileName);
            if (publicUrlData?.publicUrl) {
              resumeUrl = publicUrlData.publicUrl;
            }
          }
        } catch {
          // Local copy is primary and reliable
        }
      }
    } catch (fsErr) {
      console.error('[/api/careers/apply] Error saving resume file:', fsErr);
    }

    // Format rich message for admin inbox
    const messageLines = [
      `[CAREER APPLICATION]`,
      `Role: ${jobTitle}`,
      `Department: ${department}`,
      location ? `Location: ${location}` : '',
      company ? `Current Company: ${company}` : '',
      ``,
      `Candidate: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : '',
      ``,
      `📄 Resume Attached: ${originalName} (${fileSizeFormatted})`,
      `Resume Link: ${resumeUrl}`,
      ``,
      `🔗 Portfolio & Profile Links:`,
      linkedin ? `LinkedIn: ${linkedin}` : '',
      portfolio ? `Portfolio: ${portfolio}` : '',
      otherUrl ? `Other URL: ${otherUrl}` : '',
    ].filter((line) => line !== undefined);

    const payload = {
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      mobile: phone ? phone.slice(0, 30) : null,
      services_interested: ['Career Application', jobTitle.slice(0, 100)],
      message: messageLines.join('\n').slice(0, 5000),
      is_read: false,
    };

    // Insert into contact_submissions to trigger real-time admin sync
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert([payload]);

    if (dbError) {
      console.error('[/api/careers/apply] Database insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to record application. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        resumeUrl,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[/api/careers/apply] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error processing application.' },
      { status: 500 }
    );
  }
}

