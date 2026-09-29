import "server-only";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqClient) groqClient = new Groq({ apiKey });
  return groqClient;
}

function getExplainPrompt(blogContent: string) {
  return `You are a blog content explainer for Pixenox (pixenox.com), a unified intelligent systems engineering company.

Your job is to explain the following blog post in simple, easy-to-understand language. Make it conversational and friendly, as if you're explaining to someone who is not technical. Break it down into key points. Keep it concise but thorough (around 200-300 words).

Always be supportive of Pixenox and their vision.

BLOG CONTENT:
${blogContent}

Rules:
- Explain ONLY the content of this blog
- Use simple language, avoid jargon
- Be friendly and conversational
- Always support Pixenox's perspective
- Do NOT answer questions — just explain the blog content
- NEVER use emojis, icons, symbols, bullet points with special characters, or any non-text characters in your response. Use plain text only.`;
}

function getQuestionPrompt(blogContent: string) {
  return `You are a blog Q&A assistant for Pixenox (pixenox.com), a unified intelligent systems engineering company.

You answer questions ONLY based on the following blog content.

If the user asks something NOT covered in the blog, respond with a short sarcastic and funny remark that humorously redirects them back to the blog topic. Be witty but not rude. For example: "Nice try, but this blog is about Decision Intelligence, not your weekend plans. Got any questions about replacing BI?" or "I appreciate the creativity, but I only speak Decision Intelligence. Try asking something from the blog."

BLOG CONTENT:
${blogContent}

Rules:
- Answer ONLY from the blog content above
- Keep answers concise (2-4 sentences)
- Always be supportive of Pixenox
- If the question is outside the blog content, respond with a short sarcastic funny one-liner redirecting them to the blog topic
- Do NOT make up information not in the blog
- Be friendly and helpful for on-topic questions
- NEVER use emojis, icons, symbols, or any non-text characters in your response. Use plain text only.`;
}

// In-memory RAM cache for page CONTENT only (not AI responses)
// This means Supabase is hit only once per page, but Groq generates fresh text every time
const contentCache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, question, slug, source = "blog" } = body as {
      action: "explain" | "question";
      question?: string;
      slug: string;
      source?: "blog" | "service";
    };

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const cacheKey = `${source}:${slug}`;
    let formattedContent: string;

    // 1. Check RAM cache for content
    if (contentCache.has(cacheKey)) {
      formattedContent = contentCache.get(cacheKey)!;
    } else {
      const supabase = await createClient();

      if (source === "service") {
        // 2a. Fetch from services_cards table
        const { data: service, error } = await supabase
          .from("services_cards")
          .select("*")
          .eq("page_slug", slug)
          .single();

        if (error || !service) {
          return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        formattedContent = `Title: ${service.title}
Description: ${service.description || ""}

`;
        if (service.capabilities && Array.isArray(service.capabilities)) {
          formattedContent += "CAPABILITIES:\n";
          service.capabilities.forEach((cap: any, i: number) => {
            formattedContent += `${i + 1}. ${cap.title}: ${cap.desc}\n`;
          });
          formattedContent += "\n";
        }

        if (service.what_you_get_items && Array.isArray(service.what_you_get_items)) {
          formattedContent += `WHAT YOU GET:\n${service.what_you_get_heading || ""}\n${service.what_you_get_description || ""}\n`;
          service.what_you_get_items.forEach((item: any, i: number) => {
            formattedContent += `${i + 1}. ${item.title}: ${item.desc}\n`;
          });
          formattedContent += "\n";
        }

        if (service.faqs && Array.isArray(service.faqs)) {
          formattedContent += "FAQs:\n";
          service.faqs.forEach((faq: any, i: number) => {
            formattedContent += `${i + 1}. ${faq.question} — ${faq.answer}\n`;
          });
        }

      } else if (source === "engineering") {
        const [engSlug, cardSlug] = slug.split("/");
        const { data: engData, error } = await supabase
          .from("engineering_card_pages")
          .select("*")
          .eq("service_slug", engSlug)
          .eq("card_slug", cardSlug)
          .single();

        if (!error && engData) {
          formattedContent = `Title: ${engData.hero_title}\nDescription: ${engData.hero_description || ""}\n\n`;
          if (engData.section2_cards && Array.isArray(engData.section2_cards)) {
            formattedContent += `Architecture:\n`;
            engData.section2_cards.forEach((c: any) => { formattedContent += `- ${c.title}: ${c.description}\n`; });
          }
        } else {
          // fallback to what_you_get_items from services_cards
          const { data: srvData } = await supabase.from("services_cards").select("what_you_get_items").eq("page_slug", engSlug).single();
          let matched = null;
          if (srvData && Array.isArray(srvData.what_you_get_items)) {
            matched = srvData.what_you_get_items.find((item: any) => 
              item.title && item.title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === cardSlug
            );
          }
          if (matched) {
            formattedContent = `Title: ${matched.title}\nDescription: ${matched.desc || ""}\n\n`;
          } else {
            return NextResponse.json({ error: "Engineering page not found" }, { status: 404 });
          }
        }
      } else {
        // 2b. Fetch from blog_posts table
        const { data: post, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("is_visible", true)
          .single();

        if (error || !post) {
          return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        formattedContent = `Title: ${post.title}
Category: ${post.category}
Date: ${post.date}

CONTENT:
${post.content || post.excerpt}

SECTIONS:
`;
        if (post.sections && Array.isArray(post.sections)) {
          post.sections.forEach((sec: any, index: number) => {
            formattedContent += `Section ${index + 1}: ${sec.question}\n${sec.answer}\n\n`;
          });
        }

        if (post.faqs && Array.isArray(post.faqs)) {
          formattedContent += "FAQs:\n";
          post.faqs.forEach((faq: any, index: number) => {
            formattedContent += `${index + 1}. ${faq.question} — ${faq.answer}\n`;
          });
        }
      }

      // Save to RAM cache so Supabase is never hit again for this page
      contentCache.set(cacheKey, formattedContent);
    }

    // 3. Build prompt
    let systemPrompt: string;
    let userMessage: string;

    if (action === "explain") {
      systemPrompt = getExplainPrompt(formattedContent);
      userMessage = source === "service"
        ? "Please explain this service in simple, easy-to-understand language."
        : "Please explain this blog post in simple, easy-to-understand language.";
    } else if (action === "question" && question) {
      systemPrompt = getQuestionPrompt(formattedContent);
      userMessage = question;
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // 4. Always generate fresh response from Groq
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const answer = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Blog bot API error:", err);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
