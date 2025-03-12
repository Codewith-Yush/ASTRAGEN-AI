"use server"; // Server Component
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import HistoryClient from './_components/HistoryClient'

export interface HISTORY {
    id: number,
    formData: string,
    aiResponse: string,
    templateSlug: string,
    createdBy: string,
    createdAt: string
}

export default async function History() {
    const user = await currentUser();

    {/* @ts-ignore */}
    const HistoryList: HISTORY[] = await db.select()
        .from(AIOutput)
        .where(eq(AIOutput?.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(AIOutput.id));

    return <HistoryClient historyList={HistoryList} />;
}
