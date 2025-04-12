import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Store templates outside the handler function to avoid recreating on each request
const templates = [
  { 
    id: 1, 
    slug: "generate-blog-title", 
    aiPrompt: "Generate a blog title based on the given topic.",
    category: "content",
    exampleInput: "artificial intelligence trends"
  },
  { 
    id: 2, 
    slug: "seo-meta-description", 
    aiPrompt: "Generate an SEO-friendly meta description.",
    category: "seo",
    exampleInput: "Our guide to modern web development practices"
  },
];

export async function GET(request: NextRequest) {
  try {
    // Return cached template data with proper headers
    return NextResponse.json(
      { 
        success: true, 
        data: templates,
        count: templates.length
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        }
      }
    );
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}