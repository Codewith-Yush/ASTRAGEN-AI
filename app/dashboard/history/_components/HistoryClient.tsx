"use client";
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Templates from '@/app/(data)/Templates';
import Image from 'next/image';
import { HISTORY } from '../page';
import CopyButton from './CopyButton';

// Styled components
const StyledWrapper = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1rem;
  }

  .title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #4a5568;
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .input-container {
    margin-bottom: 1.5rem;
  }

  .input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }
  }

  .grid-header {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1fr 1fr;
    align-items: center;
    padding: 1rem;
    background: #edf2f7;
    border-radius: 8px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .grid-row {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1fr 1fr;
    align-items: center;
    padding: 1rem;
    background: #ffffff;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: #f7fafc;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      padding: 1rem;
    }
  }

  .template {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: #2d3748;
  }

  .response {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
    color: #4a5568;

    @media (max-width: 768px) {
      max-width: 100%;
      white-space: normal;
    }
  }

  .no-results {
    text-align: center;
    padding: 2rem;
    color: #718096;
    font-size: 1.125rem;
    background: #f7fafc;
    border-radius: 8px;
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
      <h2 className="title">History</h2>
      <p className="subtitle">Search your previously generated AI content</p>

      <div className="input-container">
        <input
          className="input"
          name="search"
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search history"
        />
      </div>

      <div className="grid-header">
        <h2>Template</h2>
        <h2>AI Response</h2>
        <h2>Date</h2>
        <h2>Words</h2>
        <h2>Copy</h2>
      </div>

      {filteredHistory.length > 0 ? (
        filteredHistory.map((item) => (
          <div key={item.id} className="grid-row">
            <div className="template">
              {item.template?.icon && (
                <Image
                  src={item.template.icon}
                  width={28}
                  height={28}
                  alt={item.template.name || "Template Icon"}
                  className="rounded-md"
                />
              )}
              <span>{item.template?.name || "Unknown Template"}</span>
            </div>
            <div className="response">{item.aiResponse || "No response"}</div>
            <div>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div>{item.wordCount}</div>
            <div>
              <CopyButton
                aiResponse={item.aiResponse || ''}
                className="hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        ))
      ) : (
        <div className=" dismantled-no-results">
          <p>No matching history found</p>
          <p className="text-sm mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </StyledWrapper>
  );
}