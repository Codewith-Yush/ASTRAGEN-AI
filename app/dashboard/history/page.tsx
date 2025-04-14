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
    aiResponse: string | null; // Made nullable if it can be null
    templateSlug: string;
    createdBy: string;
    createdAt: string | Date; // Made flexible for Date object or string
}

async function History() {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return <div>Please sign in to view history</div>;
    }

    const historyList = await db.select()
        .from(AIOutput)
        .where(eq(AIOutput.createdBy, email))
        .orderBy(desc(AIOutput.id)) as HISTORY[]; // Added type assertion

    const getTemplate = (slug: string): TEMPLATE | undefined => {
        return Templates?.find((item) => item.slug === slug);
    }

    const countWords = (text: string | null): number => {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    return (
        <div className='m-5 p-5 border rounded-lg bg-white'>
            <h2 className='font-bold text-3xl'>History</h2>
            <p className='text-gray-500'>Search your previously generated AI content</p>
            
            <div className='grid grid-cols-7 font-bold bg-secondary mt-5 py-3 px-3'>
                <h2 className='col-span-2'>TEMPLATE</h2>
                <h2 className='col-span-2'>AI RESPONSE</h2>
                <h2>DATE</h2>
                <h2>WORDS</h2>
                <h2>COPY</h2>
            </div>

            {historyList.length > 0 ? (
                historyList.map((item) => {
                    const template = getTemplate(item.templateSlug);
                    const date = typeof item.createdAt === 'string' 
                        ? new Date(item.createdAt) 
                        : item.createdAt;
                        
                    return (
                        <React.Fragment key={item.id}>
                            <div className='grid grid-cols-7 my-5 py-3 px-3'>
                                <h2 className='col-span-2 flex gap-2 items-center'>
                                    {template?.icon && (
                                        <Image 
                                            src={template.icon} 
                                            width={25} 
                                            height={25} 
                                            alt={`${template.name || 'template'} icon`}
                                        />
                                    )}
                                    {template?.name || 'Unknown Template'}
                                </h2>
                                <h2 className='col-span-2 line-clamp-3 mr-3'>
                                    {item.aiResponse || 'No response'}
                                </h2>
                                <h2>{date.toLocaleDateString()}</h2>
                                <h2>{countWords(item.aiResponse)}</h2>
                                <h2>
                                    <CopyButton aiResponse={item.aiResponse || ''} />
                                </h2>
                            </div>
                            <hr />
                        </React.Fragment>
                    );
                })
            ) : (
                <div className='py-5 text-center text-gray-500'>
                    No history items found
                </div>
            )}
        </div>
    )
}

export default History;