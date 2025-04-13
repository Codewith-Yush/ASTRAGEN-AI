import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { 
  Copy, 
  CheckCircle, 
  Download, 
  Maximize2, 
  Minimize2, 
  PenLine,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface OutputSectionProps {
  aiOutput: string;
  title?: string;
  onEdit?: (newContent: string) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
  showWordCount?: boolean;
  isHTML?: boolean;
}

function OutputSection({ 
  aiOutput, 
  title = "AI Output", 
  onEdit, 
  readOnly = true,
  theme = 'light',
  showWordCount = false,
  isHTML = false
}: OutputSectionProps) {
  const [content, setContent] = useState(aiOutput);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [contentType, setContentType] = useState<'html' | 'markdown'>('markdown');
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Determine if content is HTML (either via prop or detection)
  useEffect(() => {
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);
    setContentType(isHTML || hasHtmlTags ? 'html' : 'markdown');
  }, [content, isHTML]);

  // Calculate word count
  useEffect(() => {
    if (showWordCount) {
      // Strip markdown/HTML tags before counting
      let cleanText = content;
      
      if (contentType === 'html') {
        // Create a temporary div to extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        cleanText = tempDiv.textContent || tempDiv.innerText || '';
      } else {
        // Strip markdown syntax
        cleanText = content
          .replace(/```[\s\S]*?```/g, '')
          .replace(/\*\*|__|\*|_|~~|`/g, '');
      }
      
      const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const chars = cleanText.replace(/\s/g, '').length;
      setWordCount({ words, chars });
    }
  }, [content, showWordCount, contentType]);

  // Handle fullscreen mode
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isFullscreen]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadOptions) {
        const target = event.target as Node;
        const dropdown = document.querySelector('.download-options-dropdown');
        if (dropdown && !dropdown.contains(target)) {
          setShowDownloadOptions(false);
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadOptions]);

  // Initialize content from props
  useEffect(() => {
    setContent(aiOutput);
  }, [aiOutput]);

  // Handle editor content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onEdit) onEdit(newContent);
  };

  // Copy content to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Simple HTML sanitization
  const sanitizeHTML = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/onerror|onclick|onload|onmouseover|onmouseout|onmousedown|onmouseup|onfocus|onblur|onkeydown|onkeypress|onkeyup/gi, '');
  };

  // Download functions
  const getFileName = () => `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}`;
  
  const handleDownloadPDF = () => {
    try {
      const fileName = getFileName();
      
      // Create a print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please enable pop-ups to download PDF.');
        return;
      }
      
      // Determine content to render
      const htmlContent = contentType === 'html' 
        ? sanitizeHTML(content)
        : markdownToHTML(content);
      
      // Write to print window
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              color: #333;
            }
            h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.2em; }
            p { margin-bottom: 1em; }
            pre { 
              background: #f5f5f5; 
              padding: 1em; 
              border-radius: 4px; 
              overflow-x: auto;
              font-family: monospace;
            }
            code { 
              background: #f5f5f5; 
              padding: 0.2em 0.4em; 
              border-radius: 3px;
              font-family: monospace;
            }
            ul, ol { padding-left: 2em; }
            @media print {
              body { font-size: 12pt; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div id="content">${htmlContent}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                document.title = "${fileName}";
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF generation failed. Please try again.');
    }
    
    setShowDownloadOptions(false);
  };

  const handleDownloadMarkdown = () => {
    try {
      const blob = new Blob([content], { type: contentType === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const fileName = `${getFileName()}.${contentType === 'html' ? 'html' : 'md'}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
    
    setShowDownloadOptions(false);
  };

  // Convert markdown to HTML for PDF export
  const markdownToHTML = (markdown: string) => {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Process lists and paragraphs
    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (/^\- (.*)$/.test(line)) {
        // Unordered list items
        const content = line.replace(/^\- (.*)$/, '$1');
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        processedLines.push(`<li>${content}</li>`);
      } else if (/^\d+\. (.*)$/.test(line)) {
        // Ordered list items
        const content = line.replace(/^\d+\. (.*)$/, '$1');
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        processedLines.push(`<li>${content}</li>`);
      } else {
        // Regular line
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
        }
        
        if (line.trim() !== '') {
          if (!line.startsWith('<h') && !line.startsWith('<pre') && !line.startsWith('<code')) {
            processedLines.push(`<p>${line}</p>`);
          } else {
            processedLines.push(line);
          }
        } else {
          processedLines.push('<br>');
        }
      }
    }
    
    // Close any open list
    if (inList) {
      processedLines.push(`</${listType}>`);
    }
    
    return processedLines.join('\n');
  };

  // CSS class for markdown output
  const markdownClass = `prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none 
    prose-headings:font-semibold 
    prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-4 prose-h1:pb-1 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700
    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-5 prose-h2:mb-3
    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
    prose-p:leading-relaxed prose-p:mb-4 
    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
    prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
    prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
    prose-li:mb-1
    prose-table:min-w-full prose-table:my-6 prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700 prose-table:rounded-md
    prose-thead:bg-gray-50 dark:prose-thead:bg-gray-800
    prose-tbody:divide-y prose-tbody:divide-gray-200 dark:prose-tbody:divide-gray-700
    prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:text-gray-500 dark:prose-th:text-gray-400 prose-th:uppercase prose-th:tracking-wider
    prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-gray-800 dark:prose-td:text-gray-200
    prose-tr:hover:bg-gray-50 dark:prose-tr:hover:bg-gray-800/50`;

  return (
    <div 
      ref={containerRef}
      className={`bg-background border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 m-2' : 'w-full'}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {title}
            {showWordCount && (
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                {wordCount.words} words • {wordCount.chars} characters
              </span>
            )}
          </h2>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 items-center">
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)} 
              title="Edit content"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <PenLine className="w-4 h-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy} 
            title="Copy content"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {copied ? 
              <CheckCircle className="w-4 h-4 text-green-500" /> : 
              <Copy className="w-4 h-4" />
            }
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              title="Download options"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 download-btn flex items-center"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {showDownloadOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 w-40 overflow-hidden download-options-dropdown">
                <button 
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  onClick={handleDownloadMarkdown}
                >
                  {contentType === 'html' ? 'HTML (.html)' : 'Markdown (.md)'}
                </button>
                <button 
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  onClick={handleDownloadPDF}
                >
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Content Area - Improved responsive height */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-auto max-h-[calc(100vh-200px)] min-h-[200px]'} transition-all duration-300`}>
        {/* Editor */}
        {isEditing ? (
          <div className="p-1 h-full">
            <Textarea
              ref={editorRef}
              value={content}
              onChange={handleChange}
              placeholder="Edit content here..."
              className={`w-full h-full p-4 font-mono text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-gray-100 border-gray-700' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
            />
            {isEditing && (
              <div className="flex justify-end mt-2 px-4 pb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  Done Editing
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className={`overflow-auto h-full ${
              theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
            } transition-colors`}
          >
            {/* AI output container with improved styling */}
            <div className={`p-4 md:p-6 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } m-2 rounded-lg shadow-sm border ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
            }`}>
              {contentType === 'html' ? (
                // Handle HTML content with direct rendering
                <div 
                  className={markdownClass}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
                />
              ) : (
                // Handle Markdown content with ReactMarkdown
                <div className={markdownClass}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="relative group mb-6 mt-4">
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-1 text-xs text-gray-600 dark:text-gray-300 rounded-t-md border-t border-r border-l border-gray-200 dark:border-gray-700">
                              <span>{match[1]}</span>
                              <button 
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(String(children));
                                  const toast = document.createElement('div');
                                  toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50';
                                  toast.textContent = 'Code copied to clipboard!';
                                  document.body.appendChild(toast);
                                  setTimeout(() => {
                                    toast.remove();
                                  }, 2000);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              style={theme === 'dark' ? vscDarkPlus : prism}
                              language={match[1]}
                              PreTag="div"
                              className="!rounded-t-none !rounded-b-md !mt-0 !pt-4 !pb-4 border-r border-b border-l border-gray-200 dark:border-gray-700"
                              customStyle={{
                                margin: 0,
                                fontSize: '0.9rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code {...props} className={`${className} px-1 py-0.5 rounded text-sm bg-gray-100 dark:bg-gray-800`}>
                            {children}
                          </code>
                        )
                      },
                      blockquote({children}) {
                        return (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
                            {children}
                          </blockquote>
                        )
                      },
                      ul({children}) {
                        return (
                          <ul className="list-disc pl-6 my-4 space-y-2">
                            {children}
                          </ul>
                        )
                      },
                      ol({children}) {
                        return (
                          <ol className="list-decimal pl-6 my-4 space-y-2">
                            {children}
                          </ol>
                        )
                      },
                      li({children}) {
                        return (
                          <li className="mb-1">
                            {children}
                          </li>
                        )
                      },
                      h1({children}) {
                        return (
                          <h1 className="text-2xl font-bold mt-6 mb-4 pb-1 border-b border-gray-200 dark:border-gray-700">
                            {children}
                          </h1>
                        )
                      },
                      h2({children}) {
                        return (
                          <h2 className="text-xl font-bold mt-5 mb-3">
                            {children}
                          </h2>
                        )
                      },
                      h3({children}) {
                        return (
                          <h3 className="text-lg font-semibold mt-4 mb-2">
                            {children}
                          </h3>
                        )
                      },
                      table({children}) {
                        return (
                          <div className="overflow-x-auto my-6 rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              {children}
                            </table>
                          </div>
                        )
                      },
                      thead({children}) {
                        return (
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            {children}
                          </thead>
                        )
                      },
                      tbody({children}) {
                        return (
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                          </tbody>
                        )
                      },
                      tr({children}) {
                        return (
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {children}
                          </tr>
                        )
                      },
                      th({children}) {
                        return (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {children}
                          </th>
                        )
                      },
                      td({children}) {
                        return (
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                            {children}
                          </td>
                        )
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputSection;