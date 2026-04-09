import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const resendApiKey = Deno.env.get('RESEND_API_KEY');

serve(async (req: Request) => {
  try {
    const payload = await req.json()
    
    // Validate we're dealing with a new insertion wrapper from Postgres Webhooks
    if (payload.type !== 'INSERT' || payload.table !== 'contact_submissions') {
      return new Response("Invalid trigger type or table", { status: 400 })
    }

    const { name, email, message, services_interested } = payload.record

    const emailHtml = `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Services Interested:</strong> ${services_interested?.join(', ') || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #4a0e8f; padding-left: 1rem; color: #333;">
        ${message}
      </blockquote>
    `

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Pixenox Platform <notifications@pixenox.com>",
        to: ["admin@pixenox.com"], // Hardcoded or pulled from another admin table
        subject: `New Lead: ${name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
       console.error("Resend API rejected:", await res.text())
       return new Response("Failed to send email", { status: 500 })
    }

    return new Response("Email dispatched successfully", { status: 200 })
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
})
