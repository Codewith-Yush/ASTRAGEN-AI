"use client";
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Templates from '@/app/(data)/Templates';
import Image from 'next/image';
import { HISTORY } from '../page';
import CopyButton from './CopyButton';

export default function HistoryClient({ historyList }: { historyList: HISTORY[] }) {
    const [search, setSearch] = useState("");

    const GetTemplateName = (slug: string) => {
        return Templates?.find((item) => item.slug === slug);
    };

    const filteredHistory = useMemo(() => {
        return historyList.filter((item) => {
            const template = GetTemplateName(item.templateSlug);
            return (
                template?.name.toLowerCase().includes(search.toLowerCase()) ||
                item.aiResponse.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [historyList, search]);

    return (
        <StyledWrapper>
            <h2 className='title'>🕒 History</h2>
            <p className='subtitle'>Search your previously generated AI content</p>

            <div className='input-container'>
                <input 
                    className='input' 
                    name='text' 
                    type='text' 
                    placeholder='Search the history...' 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className='grid-header'>
                <h2 className='col-span-2'>TEMPLATE</h2>
                <h2 className='col-span-2'>AI RESPONSE</h2>
                <h2>DATE</h2>
                <h2>WORDS</h2>
                <h2>COPY</h2>
            </div>

            {filteredHistory.length > 0 ? (
                filteredHistory.map((item: HISTORY, index: number) => {
                    const template = GetTemplateName(item.templateSlug);

                    return (
                        <div key={item.id || index} className='grid-row'>
                            <h2 className='col-span-2 flex gap-2 items-center'>
                                {template?.icon && (
                                    <Image
                                        src={template.icon}
                                        width={30}
                                        height={30}
                                        alt={template.name || "Template Icon"}
                                        className='icon'
                                    />
                                )}
                                <span>{template?.name || "Unknown Template"}</span>
                            </h2>
                            <h2 className='col-span-2 text-gray-600 truncate'>{item.aiResponse}</h2>
                            <h2>{new Date(item.createdAt).toLocaleDateString()}</h2>
                            <h2>{item.aiResponse.length}</h2>
                            <h2><CopyButton aiResponse={item.aiResponse} /></h2>
                        </div>
                    );
                })
            ) : (
                <div className='no-results'>No matching history found 🗂️</div>
            )}
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    .title {
        font-weight: bold;
        font-size: 2rem;
        color: #333;
    }
    .subtitle {
        color: #777;
        margin-bottom: 1rem;
    }
    .input-container {
        position: relative;
        max-width: 270px;
    }
    .input {
        width: 100%;
        height: 60px;
        padding: 12px;
        font-size: 18px;
        font-family: "Courier New", monospace;
        color: #000;
        background-color: #fff;
        border: 4px solid #000;
        outline: none;
        transition: all 0.3s ease;
        box-shadow: 8px 8px 0 #000;
    }
    .input:hover {
        transform: translate(-4px, -4px);
        box-shadow: 12px 12px 0 #000;
    }
    .input:focus {
        background-color: #000;
        color: #fff;
        border-color: #fff;
    }
    .grid-header, .grid-row {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
        font-weight: bold;
        padding: 10px;
        border-bottom: 2px solid #ddd;
    }
    .grid-row:hover {
        background: #f9f9f9;
    }
    .no-results {
        text-align: center;
        color: #555;
        margin-top: 10px;
    }
`;
