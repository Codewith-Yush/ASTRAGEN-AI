import Templates from '@/app/(data)/Templates'
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { AIOutput } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import Image from 'next/image'
import React from 'react'
import { TEMPLATE } from '../_components/TemplateListSection'
import CopyButton from './_components/CopyButton'

export interface HISTORY {
    id: number;
    formData: string;
    aiResponse: string | null;
    templateSlug: string;
    createdBy: string;
    createdAt: string | Date;
}

async function History() {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-600">Please sign in to view your history</p>
            </div>
        );
    }

    const historyList = (await db.select()
        .from(AIOutput)
        .where(eq(AIOutput.createdBy, email))
        .orderBy(desc(AIOutput.id))) as HISTORY[];

    const getTemplate = (slug: string): TEMPLATE | undefined => {
        return Templates?.find((item) => item.slug === slug);
    }

    const countWords = (text: string | null): number => {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    return (
        <div className="m-6 p-6 bg-white shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">History</h2>
                <p className="text-gray-500 mt-1">Explore your previously generated AI content</p>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 font-semibold bg-gray-100 text-gray-700 rounded-lg py-4 px-6 mb-4">
                <h3 className="col-span-2">Template</h3>
                <h3 className="col-span-2">AI Response</h3>
                <h3>Date</h3>
                <h3>Words</h3>
                <h3>Actions</h3>
            </div>

            {/* Table Body */}
            {historyList.length > 0 ? (
                historyList.map((item) => {
                    const template = getTemplate(item.templateSlug);
                    const date = typeof item.createdAt === 'string'
                        ? new Date(item.createdAt)
                        : item.createdAt;

                    return (
                        <React.Fragment key={item.id}>
                            <div className="grid grid-cols-7 gap-4 items-center py-4 px-6 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                <div className="col-span-2 flex items-center gap-3">
                                    {template?.icon && (
                                        <Image
                                            src={template.icon}
                                            width={28}
                                            height={28}
                                            alt={`${template.name || 'template'} icon`}
                                            className="rounded-md"
                                        />
                                    )}
                                    <span className="text-gray-800 font-medium">
                                        {template?.name || 'Unknown Template'}
                                    </span>
                                </div>
                                <div className="col-span-2 text-gray-600 line-clamp-2">
                                    {item.aiResponse || 'No response'}
                                </div>
                                <div className="text-gray-500">
                                    {date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div className="text-gray-500">
                                    {countWords(item.aiResponse)}
                                </div>
                                <div>
                                    <CopyButton
                                        aiResponse={item.aiResponse || ''}
                                        className="hover:scale-105 transition-transform duration-200"
                                    />
                                </div>
                            </div>
                            <hr className="border-gray-200 my-2" />
                        </React.Fragment>
                    );
                })
            ) : (
                <div className="py-12 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No history items found</p>
                    <p className="text-gray-400 mt-2">Start generating AI content to see it here!</p>
                </div>
            )}
        </div>
    );
}

export default History;