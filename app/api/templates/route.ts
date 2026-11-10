import { NextResponse } from "next/server";
import Templates from "@/app/(data)/Templates";

export const revalidate = 86400; // Static ISR cache for 24 hours

export async function GET() {
  try {
    // Return sanitized public metadata for all templates without leaking internal prompts
    const sanitizedTemplates = Templates.map((t) => ({
      slug: t.slug,
      name: t.name,
      desc: t.desc,
      category: t.category,
      icon: t.icon,
      fieldsCount: t.form.length,
    }));

    return NextResponse.json(
      {
        success: true,
        data: sanitizedTemplates,
        count: sanitizedTemplates.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
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
