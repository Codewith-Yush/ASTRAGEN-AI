import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { AIOutput, UserSubscription } from "@/utils/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check active subscription
    const subscription = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.email, email))
      .limit(1);

    const isSubscribed = subscription.length > 0 && subscription[0].active === true;
    const maxWords = isSubscribed ? 1000000 : 300000;

    // Aggregate word count / character count from database
    const usageResult = await db
      .select({
        totalWords: sql<number>`coalesce(sum(case when "wordCount" > 0 then "wordCount" else length("aiResponse") end), 0)::int`,
      })
      .from(AIOutput)
      .where(eq(AIOutput.createdBy, email));

    const totalUsage = usageResult[0]?.totalWords ?? 0;

    return NextResponse.json({
      totalUsage,
      maxWords,
      isSubscribed,
    });
  } catch (error: any) {
    console.error("Error fetching usage statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data", totalUsage: 0, maxWords: 300000, isSubscribed: false },
      { status: 500 }
    );
  }
}

