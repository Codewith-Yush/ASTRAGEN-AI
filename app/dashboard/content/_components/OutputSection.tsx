import React, { useRef, useState, useEffect } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { 
  Copy, 
  CheckCircle, 
  Download, 
  Maximize2, 
  Minimize2, 
  PenLine,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutputSectionProps {
  aiOutput: string;
  title?: string;
  onEdit?: (newContent: string) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
  showWordCount?: boolean;
}

function OutputSection({ 
  aiOutput, 
  title = "AI Output", 
  onEdit, 
  readOnly = true,
  theme = 'light',
  showWordCount = false
}: OutputSectionProps) {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [cleanContent, setCleanContent] = useState('');

  // Clean markdown content
  const cleanMarkdown = (content: string) => {
    return content
      .replace(/<\/?(?:p|h[1-6]|ul|ol|li)>/g, '')
      .replace(/<\/?strong>/g, '**')
      .replace(/<\/?em>/g, '*')
      .replace(/<\/?a[^>]*>/g, '')
      .replace(/&(?:nbsp|lt|gt|amp);/g, match => 
        match === '&nbsp;' ? ' ' : 
        match === '&lt;' ? '<' : 
        match === '&gt;' ? '>' : '&'
      )
      .replace(
        /<pre><code>([\s\S]*?)<\/code><\/pre>/g, 
        (_, code) => `\`\`\`\n${code}\n\`\`\``
      )
      .replace(/<\/?code>/g, '`')
      .trim();
  };

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    try {
      const editorInstance = editorRef.current.getInstance();
      const cleaned = cleanMarkdown(aiOutput);
      setCleanContent(cleaned);
      editorInstance.setMarkdown(cleaned);
      
      configureEditor();
      if (showWordCount) updateWordCount(cleaned);
      enhanceCodeBlocks();
    } catch (error) {
      console.error("Editor initialization error:", error);
    }
  }, [aiOutput, readOnly, isEditing, theme, showWordCount]);

  // Configure editor appearance
  const configureEditor = () => {
    const editorEl = editorRef.current?.getRootElement();
    if (!editorEl) return;
    
    // Set read-only state
    if (readOnly && !isEditing) {
      editorEl.classList.add('toastui-editor-readonly');
      const toolbar = editorEl.querySelector('.toastui-editor-toolbar');
      if (toolbar) toolbar.style.display = 'none';
    } else {
      editorEl.classList.remove('toastui-editor-readonly');
      const toolbar = editorEl.querySelector('.toastui-editor-toolbar');
      if (toolbar) toolbar.style.display = 'block';
    }
    
    // Apply theme
    editorEl.classList.toggle('dark-theme', theme === 'dark');
  };

  // Handle fullscreen mode
  useEffect(() => {
    if (!editorRef.current) return;
    
    const height = isFullscreen ? "calc(100vh - 120px)" : "400px";
    editorRef.current.getInstance().setHeight(height);
    
    const editorEl = editorRef.current.getRootElement();
    const contentEl = editorEl?.querySelector('.toastui-editor-contents');
    if (contentEl) {
      contentEl.style.overflowY = 'auto';
      contentEl.style.maxHeight = isFullscreen ? 'calc(100vh - 180px)' : '340px';
    }
    
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

  // Calculate word count
  const updateWordCount = (text: string) => {
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*|__|\*|_|~~|`/g, '');
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = cleanText.replace(/\s/g, '').length;
    setWordCount({ words, chars });
  };

  // Add copy buttons to code blocks
  const enhanceCodeBlocks = () => {
    if (!editorRef.current) return;
    
    setTimeout(() => {
      try {
        const editorEl = editorRef.current.getRootElement();
        const contentArea = editorEl?.querySelector('.toastui-editor-contents');
        if (!contentArea) return;
        
        const codeBlocks = contentArea.querySelectorAll('pre');
        codeBlocks.forEach((block: HTMLElement) => {
          if (block.dataset.enhanced === 'true') return;
          
          const copyBtn = document.createElement('button');
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          copyBtn.className = 'code-copy-btn';
          Object.assign(copyBtn.style, {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            borderRadius: '4px',
            padding: '4px',
            cursor: 'pointer'
          });
          
          copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const code = block.querySelector('code');
            if (code) {
              navigator.clipboard.writeText(code.textContent || '')
                .then(() => {
                  copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                  setTimeout(() => {
                    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                  }, 2000);
                });
            }
          });
          
          block.style.position = 'relative';
          block.appendChild(copyBtn);
          block.dataset.enhanced = 'true';
        });
      } catch (error) {
        console.error("Error enhancing code blocks:", error);
      }
    }, 300);
  };

  // Handle editor content changes
  const handleChange = () => {
    if (!editorRef.current || !onEdit) return;
    
    const newContent = editorRef.current.getInstance().getMarkdown();
    setCleanContent(newContent);
    onEdit(newContent);
    if (showWordCount) updateWordCount(newContent);
  };

  // Copy content to clipboard
  const handleCopy = () => {
    if (!editorRef.current) return;
    
    try {
      const content = editorRef.current.getInstance().getMarkdown();
      navigator.clipboard.writeText(content)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    } catch (err) {
      navigator.clipboard.writeText(cleanContent);
    }
  };

  // Convert markdown to HTML
  const markdownToHTML = (markdown: string) => {
    // Process headings, bold, italics, and code
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

  // Download functions
  const getFileName = () => `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}`;
  
  const handleDownloadPDF = () => {
    if (!editorRef.current) return;
    
    try {
      const markdownContent = editorRef.current.getInstance().getMarkdown();
      const fileName = getFileName();
      
      // Create a print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please enable pop-ups to download PDF.');
        return;
      }
      
      // Generate HTML content
      const htmlContent = markdownToHTML(markdownContent);
      
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
      const content = editorRef.current ? 
        editorRef.current.getInstance().getMarkdown() : 
        cleanContent;
      
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const fileName = `${getFileName()}.md`;
      
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

  return (
    <div className={`bg-background border rounded-lg shadow-md overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 m-2' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-secondary/30">
        <h2 className="text-lg font-bold text-foreground truncate">
          {title}
          {showWordCount && <span className="ml-2 text-xs font-normal opacity-70">{wordCount.words} words</span>}
        </h2>
        
        {/* Action buttons */}
        <div className="flex gap-1 items-center">
          {readOnly && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} title="Toggle editing">
              <PenLine className="w-4 h-4" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleCopy} title="Copy content">
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              title="Download options"
              className="download-btn"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {showDownloadOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border download-options-dropdown">
                <button 
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleDownloadMarkdown}
                >
                  Markdown (.md)
                </button>
                <button 
                  className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-t"
                  onClick={handleDownloadPDF}
                >
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Editor */}
      <Editor
        ref={editorRef}
        initialValue={cleanContent || "Loading..."}
        initialEditType="wysiwyg"
        height={isFullscreen ? "calc(100vh - 120px)" : "400px"}
        previewStyle="vertical"
        useCommandShortcut={!readOnly || isEditing}
        onChange={handleChange}
      />
      
      {/* Global styles */}
      <style jsx global>{`
        .toastui-editor-defaultUI { border: none !important; }
        .toastui-editor-contents { overflow-y: auto !important; padding: 0 8px !important; }
        .code-copy-btn { opacity: 0.6; transition: opacity 0.2s; }
        .code-copy-btn:hover { opacity: 1; }
        .dark-theme .toastui-editor-contents { background-color: #1e1e2e; color: #cdd6f4; }
        .dark-theme .toastui-editor-toolbar { background-color: #181825; border-bottom: 1px solid #313244; }
      `}</style>
    </div>
  );
}

export default OutputSection;