"use client";
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Templates from '@/app/(data)/Templates';
import Image from 'next/image';
import { HISTORY } from '../page';
import CopyButton from './CopyButton';

// Styled components
const StyledWrapper = styled.div`
  max-width: 1320px;
  margin: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .subtitle {
    color: #666;
    margin-bottom: 16px;
  }

  .input-container {
    margin-bottom: 16px;
  }

  .input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .grid-header, .grid-row {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1fr 1fr;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .grid-header {
    font-weight: 600;
    background: #e9ecef;
  }

  .grid-row {
    background: white;
    transition: background 0.2s ease-in-out;
    
    &:hover {
      background: #f1f3f5;
    }
  }

  .template {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .response {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;
  }

  .no-results {
    text-align: center;
    padding: 20px;
    color: #777;
  }
`;

interface Template {
  slug: string;
  name: string;
  icon?: string;
}

interface ProcessedHistoryItem extends HISTORY {
  template?: Template;
  wordCount: number;
}

export default function HistoryClient({ historyList }: { historyList: HISTORY[] }) {
  const [search, setSearch] = useState("");

  const templateCache = useMemo(() => {
    const cache: Record<string, Template | undefined> = {};
    
    historyList.forEach(item => {
      if (!cache[item.templateSlug]) {
        cache[item.templateSlug] = Templates?.find((template) => template.slug === item.templateSlug);
      }
    });
    return cache;
  }, [historyList]);

  const processedHistory = useMemo<ProcessedHistoryItem[]>(() => {
    return historyList.map(item => {
      const responseText = item.aiResponse || '';
      const wordCount = responseText.trim() ? responseText.trim().split(/\s+/).length : 0;
      
      return {
        ...item,
        template: templateCache[item.templateSlug],
        wordCount
      };
    });
  }, [historyList, templateCache]);

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return processedHistory;
    
    const lowerSearch = search.toLowerCase();
    return processedHistory.filter((item) => {
      const responseText = item.aiResponse?.toLowerCase() || '';
      const templateName = item.template?.name.toLowerCase() || '';
      
      return (
        templateName.includes(lowerSearch) ||
        responseText.includes(lowerSearch)
      );
    });
  }, [processedHistory, search]);

  return (
    <StyledWrapper>
      <h2 className='title'>History</h2>
      <p className='subtitle'>Search your previously generated AI content</p>

      <div className='input-container'>
        <input 
          className='input' 
          name='text' 
          type='text' 
          placeholder='Search history...' 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className='grid-header'>
        <h2>Template</h2>
        <h2>AI Response</h2>
        <h2>Date</h2>
        <h2>Words</h2>
        <h2>Copy</h2>
      </div>

      {filteredHistory.length > 0 ? (
        filteredHistory.map((item) => (
          <div key={item.id} className='grid-row'>
            <div className='template'>
              {item.template?.icon && (
                <Image
                  src={item.template.icon}
                  width={24}
                  height={24}
                  alt={item.template.name || "Template Icon"}
                />
              )}
              <span>{item.template?.name || "Unknown Template"}</span>
            </div>
            <div className='response'>{item.aiResponse || "No response"}</div>
            <div>{new Date(item.createdAt).toLocaleDateString()}</div>
            <div>{item.wordCount}</div>
            <div><CopyButton aiResponse={item.aiResponse || ''} /></div>
          </div>
        ))
      ) : (
        <div className='no-results'>No matching history found</div>
      )}
    </StyledWrapper>
  );
}