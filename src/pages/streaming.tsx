// Enhanced Streaming Code Display Component - Main Content Version
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
 
} from 'lucide-react';




export const StreamingCodeDisplay: React.FC<{
  content: string;
  isStreaming: boolean;
  files: Array<{ filename: string; content: string; isComplete: boolean; size?: number }>;
  currentFile?: string;
  progress: number;
}> = ({ content, isStreaming, files, currentFile, progress }) => {
  const [displayContent, setDisplayContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [streamingSpeed, setStreamingSpeed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // PERFORMANCE: Throttled content update
  const throttledSetDisplayContent = useCallback((newContent: string) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 100) {
      return;
    }
    lastUpdateRef.current = now;
    setDisplayContent(newContent);
  }, []);

  // Auto-scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (contentRef.current && !isUserScrolling) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isUserScrolling]);

  // Handle user scroll detection
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
    
    if (!isAtBottom) {
      setIsUserScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Resume auto-scroll after 3 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
    } else {
      setIsUserScrolling(false);
    }
  }, []);

  // Streaming content effect with auto-scroll
  useEffect(() => {
    if (!isStreaming) {
      setDisplayContent(content);
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const speed = content.length / elapsed;
    
    if (elapsed % 0.5 < 0.1) {
      setStreamingSpeed(prevSpeed => {
        if (Math.abs(speed - prevSpeed) > 500) {
          return speed;
        }
        return prevSpeed;
      });
    }

    let index = displayContent.length;
    const chunkSize = Math.min(50, Math.max(5, Math.floor(speed / 2000)));
    
    const updateContent = () => {
      if (index < content.length) {
        const nextIndex = Math.min(index + chunkSize, content.length);
        throttledSetDisplayContent(content.slice(0, nextIndex));
        index = nextIndex;
        
        // Auto-scroll every 5 chunks (better performance)
        if (index % (chunkSize * 5) === 0) {
          setTimeout(scrollToBottom, 100);
        }
        
        animationFrameRef.current = requestAnimationFrame(updateContent);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateContent);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, isStreaming, throttledSetDisplayContent, displayContent.length, scrollToBottom]);

  // Auto-scroll when content changes
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [displayContent, isStreaming, scrollToBottom]);

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (!isStreaming && !content) return null;

  const completedFiles = files.filter(f => f.isComplete);

  return (
    <div className="h-full relative">
 <style dangerouslySetInnerHTML={{
        __html: `
          #streaming-content::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
          }
          #streaming-content {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          
          /* Also target any child divs */
          #streaming-content div::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
          }
        `
      }} />
      {/* Enhanced Transparent Screen Overlay - BEHIND PUPPY */}
{isStreaming && (
  <div className="absolute inset-0 z-10 rounded-lg">
    {/* Extremely light backdrop - barely visible */}
    <div className="absolute inset-0 bg-gray-100/15 rounded-lg"></div>
    
    {/* Optional: Very faint gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-gray-50/5 rounded-lg"></div>
  </div>
)}

      {/* Bouncing Puppy Overlay - ON TOP OF EVERYTHING */}
      {isStreaming && (
        <div className="puppy-overlay z-50">
          {/* Translucent glow background */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-full w-32 h-32 blur-xl -translate-x-16 -translate-y-16 animate-pulse"></div>
          
          {/* Main bouncing puppy */}
          <img
            src="/main.png"
            alt="CodePup Logo"
            className="w-20 h-20 object-contain puppy-bounce puppy-float"
            style={{
              filter: 'drop-shadow(0 8px 25px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))',
            }}
          />
          
          {/* Pulsing rings around puppy */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24">
            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-2 border-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-4 border-2 border-blue-300/15 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      )}

      {/* Main streaming content - BEHIND OVERLAYS */}
      <div className={`h-full text-gray-800 flex flex-col border border-gray-200/50 rounded-lg overflow-hidden relative z-5 ${
        isStreaming ? 'bg-white/90' : 'bg-white/95'
      }`}>
        
        {/* Simple Header */}
        <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium text-gray-700">Generating Code</span>
              </div>
              
              {isStreaming && streamingSpeed > 0 && (
                <div className="text-sm text-gray-500">
                  {(streamingSpeed / 1000).toFixed(1)}k chars/s
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{completedFiles.length}/{files.length} files</span>
              <span>{progress.toFixed(0)}%</span>
              {/* Auto-scroll indicator */}
              {isStreaming && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isUserScrolling ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                  <span className="text-xs">{isUserScrolling ? 'Manual' : 'Auto'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {isStreaming && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full"></div>
              )}
            </div>
          </div>

          {/* Current File Indicator */}
          {currentFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Generating: <span className="font-medium">{currentFile.split('/').pop()}</span></span>
            </div>
          )}
        </div>

        {/* Content Area with Auto-Scroll */}
      <div className="flex-1 overflow-hidden">
          <div 
          id="streaming-content"
          ref={contentRef}
          className="h-full p-6 overflow-auto bg-gray-50/50 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflow: 'auto'
          }}
          onScroll={handleScroll}
        >
            <div className="bg-white rounded-lg p-4 border border-gray-200/50 shadow-sm relative">
              
              {/* CODE CONTENT - AT THE BOTTOM */}
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 font-mono relative z-5">
                {displayContent.length > 15000 
                  ? '...[showing recent content]...\n' + displayContent.slice(-15000)
                  : displayContent
                }
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                )}
              </pre>

              {/* LIGHTER BACKDROP OVERLAY - OVER CODE, UNDER FILES */}
              {isStreaming && (
                <div className="absolute inset-0 z-10 rounded-lg">
                  {/* Much lighter backdrop - you can see through it */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-lg"></div>
                  
                  {/* Very subtle gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 rounded-lg"></div>
                </div>
              )}

              {/* ANIMATED FILES DISPLAY - ABOVE BACKDROP, BELOW PUPPY */}
              {isStreaming && (
    <div className="absolute inset-0 z-10 rounded-lg">
      <div className="absolute inset-0 bg-gray-100/12 rounded-lg"></div>
    </div>
  )}
            </div>
          </div>

          {/* Scroll to bottom button - appears when user is scrolling */}
          {isStreaming && isUserScrolling && (
            <button
              onClick={() => {
                setIsUserScrolling(false);
                scrollToBottom();
              }}
              className="absolute bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Simple Footer */}
        <div className="bg-gray-50/90 border-t border-gray-200/50 p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{displayContent.length.toLocaleString()} characters</span>
            <span>{progress.toFixed(1)}% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export class StreamingCodeParser {
  private static lastParseTime = 0;
  private static parseCache = new Map<string, any>();
  
  static parseStreamingChunk(chunk: string): {
    files: Array<{ filename: string; content: string; isComplete: boolean; size: number }>;
    currentFile?: string;
    progress: number;
    totalSize: number;
  } {
    const now = Date.now();
    
    // Cache key based on chunk size and content hash
    const cacheKey = `${chunk.length}-${chunk.slice(0, 100).replace(/\s/g, '')}`;
    if (now - this.lastParseTime < 100 && this.parseCache.has(cacheKey)) {
      return this.parseCache.get(cacheKey);
    }
    this.lastParseTime = now;

    // Limit chunk size for performance but keep more context
    const limitedChunk = chunk.length > 50000 ? chunk.slice(-50000) : chunk;
    
    const files: Array<{ filename: string; content: string; isComplete: boolean; size: number }> = [];
    let currentFile: string | undefined;
    let progress = 0;
    let totalSize = 0;

    // Strategy 1: Use LLMCodeParser JSON extraction logic
    try {
      const extractedJson = this.extractJsonFromText(limitedChunk);
      if (extractedJson) {
        const data = JSON.parse(extractedJson);
        
        // Handle different JSON structures (same as LLMCodeParser)
        let codefilesData: Record<string, string>;

        if (data.codefiles) {
          // Direct codefiles structure
          codefilesData = data.codefiles;
        } else if (data.content && data.content[0] && data.content[0].text) {
          // Nested structure - extract from content
          const innerData = JSON.parse(data.content[0].text);
          if (innerData.codefiles) {
            codefilesData = innerData.codefiles;
          } else {
            throw new Error("No codefiles found in nested structure");
          }
        } else {
          throw new Error("Missing or invalid codefiles property");
        }

        // Extract and unescape code files using LLMCodeParser logic
        Object.entries(codefilesData).forEach(([path, content]) => {
          const filename = path.replace(/^[\/\\]+/, '');
          const unescapedContent = this.unescapeString(content as string);
          const size = unescapedContent.length;
          const isComplete = this.isFileComplete(unescapedContent, filename);
          
          if (this.isValidFilename(filename)) {
            files.push({ filename, content: unescapedContent, isComplete, size });
            totalSize += size;
            
            if (!isComplete) {
              currentFile = filename;
            }
          }
        });

        if (files.length > 0) {
          console.log(`✅ LLMCodeParser JSON Strategy: Found ${files.length} files`);
        }
      }
    } catch (e) {
      console.log('LLMCodeParser JSON parsing failed, trying fallback methods:', e);
    }

    // Strategy 2: Enhanced JSON structure parsing (existing logic as fallback)
    if (files.length === 0) {
      try {
        const jsonPatterns = [
          /\{[^{}]*"codefiles"\s*:\s*\{((?:[^{}]|\{[^{}]*\})*)\}[^{}]*\}/g,
          /"codefiles"\s*:\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g,
          /"codefiles"\s*:\s*\{([\s\S]*?)\}/g
        ];

        for (const pattern of jsonPatterns) {
          const matches = Array.from(limitedChunk.matchAll(pattern));
          for (const match of matches) {
            try {
              const codefilesContent = match[1];
              const parsedFiles = this.parseCodefilesContent(codefilesContent);
              files.push(...parsedFiles);
              
              if (parsedFiles.length > 0) {
                console.log(`✅ JSON Strategy: Found ${parsedFiles.length} files`);
                break;
              }
            } catch (e) {
              console.log('JSON parse attempt failed:', e);
            }
          }
          if (files.length > 0) break;
        }
      } catch (e) {
        console.log('JSON parsing failed, trying fallback methods:', e);
      }
    }

    // Strategy 3: Direct file pattern matching (improved)
    if (files.length === 0) {
      try {
        const filePatterns = [
          /"([^"]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
          /'([^']+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))'\s*:\s*'((?:[^'\\]|\\.)*)'/g,
          /([^"'\s]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql))\s*:\s*"((?:[^"\\]|\\.)*)"/g
        ];

        for (const pattern of filePatterns) {
          const matches = Array.from(limitedChunk.matchAll(pattern));
          for (const match of matches) {
            const filename = match[1].trim().replace(/^[\/\\]+/, '');
            let content = match[2];
            
            // Use LLMCodeParser unescaping
            content = this.unescapeString(content);
            
            const size = content.length;
            const isComplete = this.isFileComplete(content, filename);
            
            if (content.length > 10 && this.isValidFilename(filename)) {
              files.push({ filename, content, isComplete, size });
              totalSize += size;
              
              if (!isComplete) {
                currentFile = filename;
              }
            }
          }
          if (files.length > 0) {
            console.log(`✅ Direct Pattern: Found ${files.length} files`);
            break;
          }
        }
      } catch (e) {
        console.log('Direct pattern parsing failed:', e);
      }
    }

    // Strategy 4: Markdown code blocks with file headers
    if (files.length === 0) {
      const markdownPatterns = [
        /```(?:typescript|tsx|ts|javascript|jsx|js|css|html|json|sql|env|python|java|c|cpp|php|ruby|go|rust|swift|kotlin|scala):([^\n]+)\n([\s\S]*?)```/g,
        /```(?:typescript|tsx|ts|javascript|jsx|js|css|html|json|sql|env|python|java|c|cpp|php|ruby|go|rust|swift|kotlin|scala)\s+([^\n]+)\n([\s\S]*?)```/g,
        /```(?:typescript|tsx|ts|javascript|jsx|js|css|html|json|sql|env|python|java|c|cpp|php|ruby|go|rust|swift|kotlin|scala)\s*\n\/\/\s*([^\n]+)\n([\s\S]*?)```/g,
        /```(?:typescript|tsx|ts|javascript|jsx|js|css|html|json|sql|env|python|java|c|cpp|php|ruby|go|rust|swift|kotlin|scala)\s*\n\/\*\s*([^\*]+)\s*\*\/\n([\s\S]*?)```/g
      ];

      for (const pattern of markdownPatterns) {
        const matches = Array.from(limitedChunk.matchAll(pattern));
        for (const match of matches) {
          const filename = match[1].trim().replace(/^[\/\\]+/, '');
          const content = match[2].trim();
          const size = content.length;
          
          if (content.length > 20 && this.isValidFilename(filename)) {
            const isComplete = this.isFileComplete(content, filename);
            files.push({ filename, content, isComplete, size });
            totalSize += size;
            
            if (!isComplete) {
              currentFile = filename;
            }
          }
        }
        if (files.length > 0) {
          console.log(`✅ Markdown Pattern: Found ${files.length} files`);
          break;
        }
      }
    }

    // Strategy 5: File headers followed by code blocks
    if (files.length === 0) {
      const headerPatterns = [
        /##\s*([^\n]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))\s*\n```[^\n]*\n([\s\S]*?)```/g,
        /###?\s*`([^`]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))`\s*\n```[^\n]*\n([\s\S]*?)```/g,
        /File:\s*([^\n]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))\s*\n```[^\n]*\n([\s\S]*?)```/g,
        /\*\*([^\*]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala))\*\*\s*\n```[^\n]*\n([\s\S]*?)```/g
      ];

      for (const pattern of headerPatterns) {
        const matches = Array.from(limitedChunk.matchAll(pattern));
        for (const match of matches) {
          const filename = match[1].trim().replace(/^[\/\\]+/, '');
          const content = match[2].trim();
          const size = content.length;
          
          if (content.length > 20 && this.isValidFilename(filename)) {
            const isComplete = this.isFileComplete(content, filename);
            files.push({ filename, content, isComplete, size });
            totalSize += size;
            
            if (!isComplete) {
              currentFile = filename;
            }
          }
        }
        if (files.length > 0) {
          console.log(`✅ Header Pattern: Found ${files.length} files`);
          break;
        }
      }
    }

    // Remove duplicates and merge similar files
    const uniqueFiles = this.deduplicateFiles(files);

    // Calculate progress
    progress = this.calculateProgress(uniqueFiles, chunk.length);

    // If we have a current file being generated, adjust progress
    if (currentFile && uniqueFiles.length > 0) {
      const fileIndex = uniqueFiles.findIndex(f => f.filename === currentFile);
      if (fileIndex !== -1) {
        progress = Math.max(progress, ((fileIndex + 0.5) / uniqueFiles.length) * 100);
      }
    }

    // Final progress calculation
    totalSize = uniqueFiles.reduce((sum, file) => sum + file.size, 0);
    progress = Math.min(Math.max(progress, 0), 99);

    const result = { 
      files: uniqueFiles, 
      currentFile, 
      progress, 
      totalSize 
    };

    // Cache result
    this.parseCache.set(cacheKey, result);
    if (this.parseCache.size > 50) {
      const firstKey = this.parseCache.keys().next().value;
      if (firstKey !== undefined) {
        this.parseCache.delete(firstKey);
      }
    }

    // Debug logging
    console.log(`🔍 Parser found ${uniqueFiles.length} files, progress: ${progress.toFixed(1)}%`);
    if (currentFile) {
      console.log(`📝 Currently generating: ${currentFile}`);
    }
    if (uniqueFiles.length > 0) {
      console.log(`📁 Files: ${uniqueFiles.map(f => `${f.filename} (${f.size}b)`).join(', ')}`);
    }

    return result;
  }

  /**
   * Extracts JSON from text, handling various formats - from LLMCodeParser
   */
  private static extractJsonFromText(input: string): string | null {
    // Try to parse the input as JSON directly first
    try {
      JSON.parse(input);
      return input;
    } catch (e) {
      // Continue with extraction methods
    }

    // Handle nested JSON structure (like your example)
    try {
      const parsed = JSON.parse(input);
      if (parsed.content && parsed.content[0] && parsed.content[0].text) {
        return this.extractJsonFromText(parsed.content[0].text);
      }
    } catch (e) {
      // Continue with other methods
    }

    // Remove markdown code blocks if present
    let cleanInput = input
      .replace(/```json\s*\n?/g, "")
      .replace(/```\s*$/g, "");

    // Find the first opening brace and last closing brace
    const firstBrace = cleanInput.indexOf("{");
    const lastBrace = cleanInput.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      return null; // No valid JSON object found
    }

    return cleanInput.substring(firstBrace, lastBrace + 1);
  }

  /**
   * Unescapes JSON escaped strings - from LLMCodeParser
   */
  private static unescapeString(str: string): string {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }

  private static parseCodefilesContent(content: string): Array<{ filename: string; content: string; isComplete: boolean; size: number }> {
    const files: Array<{ filename: string; content: string; isComplete: boolean; size: number }> = [];
    
    try {
      // Try to parse as JSON first
      const jsonContent = `{${content}}`;
      const parsed = JSON.parse(jsonContent);
      
      Object.entries(parsed).forEach(([filename, fileContent]) => {
        if (typeof fileContent === 'string' && this.isValidFilename(filename)) {
          const unescapedContent = this.unescapeString(fileContent);
          const size = unescapedContent.length;
          const isComplete = this.isFileComplete(unescapedContent, filename);
          
          files.push({ filename, content: unescapedContent, isComplete, size });
        }
      });
    } catch (e) {
      // If JSON parsing fails, try manual parsing
      const filePattern = /"([^"]+\.(?:tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql))"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      let match;
      
      while ((match = filePattern.exec(content)) !== null) {
        const filename = match[1].trim();
        const fileContent = this.unescapeString(match[2]);
        const size = fileContent.length;
        const isComplete = this.isFileComplete(fileContent, filename);
        
        if (this.isValidFilename(filename)) {
          files.push({ filename, content: fileContent, isComplete, size });
        }
      }
    }
    
    return files;
  }

  private static isValidFilename(filename: string): boolean {
    // Check if filename has valid extension and reasonable length
    const validExtensions = /\.(tsx?|jsx?|js|ts|css|html?|json|md|txt|env|sql|py|java|c|cpp|php|rb|go|rs|swift|kt|scala)$/i;
    return validExtensions.test(filename) && 
           filename.length > 3 && 
           filename.length < 200 &&
           !filename.includes('..') &&
           !/[<>:"|?*]/.test(filename);
  }

  private static isFileComplete(content: string, filename: string): boolean {
    if (content.length < 30) return false;
    
    // Check for incomplete indicators
    const incompleteIndicators = [
      '...',
      '// ... rest of',
      '/* ... */',
      '// TODO',
      '// INCOMPLETE',
      '// PARTIAL',
      '..more content..',
      'TRUNCATED',
      '[CONTENT CONTINUES]'
    ];
    
    const hasIncompleteIndicator = incompleteIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasIncompleteIndicator) return false;
    
    // Basic structure checks based on file type
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return content.includes('export') && (content.includes('return') || content.includes('React'));
      case 'ts':
      case 'js':
        return content.includes('export') || content.includes('function') || content.includes('const');
      case 'css':
        return content.includes('{') && content.includes('}');
      case 'json':
        try {
          JSON.parse(content);
          return true;
        } catch {
          return false;
        }
      case 'html':
        return content.includes('<') && content.includes('>');
      default:
        return content.length > 50;
    }
  }

  private static deduplicateFiles(files: Array<{ filename: string; content: string; isComplete: boolean; size: number }>): Array<{ filename: string; content: string; isComplete: boolean; size: number }> {
    const fileMap = new Map<string, { filename: string; content: string; isComplete: boolean; size: number }>();
    
    files.forEach(file => {
      const existing = fileMap.get(file.filename);
      if (!existing || file.content.length > existing.content.length) {
        fileMap.set(file.filename, file);
      }
    });
    
    return Array.from(fileMap.values());
  }

  private static calculateProgress(files: Array<{ filename: string; content: string; isComplete: boolean; size: number }>, chunkLength: number): number {
    if (files.length === 0) {
      // Base progress on chunk size if no files detected
      return Math.min((chunkLength / 100000) * 100, 90);
    }
    
    const completedFiles = files.filter(f => f.isComplete).length;
    const totalFiles = files.length;
    
    // Calculate progress based on completion ratio
    let progress = (completedFiles / totalFiles) * 100;
    
    // Adjust based on total content size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50000) {
      progress = Math.min(progress + 10, 95);
    }
    
    return progress;
  }

  static categorizeFiles(files: Array<{ filename: string; content: string; isComplete: boolean }>) {
    const categories = {
      components: [] as any[],
      pages: [] as any[],
      utils: [] as any[],
      styles: [] as any[],
      config: [] as any[],
      types: [] as any[],
      tests: [] as any[],
      assets: [] as any[],
      other: [] as any[]
    };

    files.forEach(file => {
      const path = file.filename.toLowerCase();
      
      if (path.includes('component') || path.includes('/components/') || path.endsWith('.tsx') || path.endsWith('.jsx')) {
        categories.components.push(file);
      } else if (path.includes('page') || path.includes('/pages/') || path.includes('/views/')) {
        categories.pages.push(file);
      } else if (path.includes('util') || path.includes('/utils/') || path.includes('/helpers/')) {
        categories.utils.push(file);
      } else if (path.includes('.css') || path.includes('style') || path.includes('/styles/')) {
        categories.styles.push(file);
      } else if (path.includes('config') || path.includes('.config.') || path.includes('vite') || path.includes('package.json')) {
        categories.config.push(file);
      } else if (path.includes('type') || path.includes('/types/') || path.includes('.d.ts')) {
        categories.types.push(file);
      } else if (path.includes('test') || path.includes('.test.') || path.includes('.spec.')) {
        categories.tests.push(file);
      } else if (path.includes('asset') || path.includes('/assets/') || path.includes('/public/')) {
        categories.assets.push(file);
      } else {
        categories.other.push(file);
      }
    });

    return categories;
  }

  /**
   * Generate a structure tree like LLMCodeParser (optional utility)
   */
  static generateStructureTree(files: Array<{ filename: string; content: string; isComplete: boolean; size: number }>): Record<string, any> {
    const structure: Record<string, any> = {};

    files.forEach((file) => {
      const pathParts = file.filename.split("/");
      let current = structure;

      // Navigate/create directory structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }

      // Set file status
      const fileName = pathParts[pathParts.length - 1];
      current[fileName] = file.isComplete ? "complete" : "incomplete";
    });

    return structure;
  }
}

// Enhanced File Completion Tracker for Messages - Unchanged for sidebar use
export const FileCompletionTracker: React.FC<{
  files: Array<{ filename: string; content: string; isComplete: boolean; size?: number }>;
  currentFile?: string;
  showCategories?: boolean;
}> = ({ files, currentFile, showCategories = false }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['components', 'pages']);
  
  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase();
    if (ext.includes('.tsx') || ext.includes('.jsx')) return '⚛️';
    if (ext.includes('.ts') || ext.includes('.js')) return '📜';
    if (ext.includes('.css')) return '🎨';
    if (ext.includes('.json')) return '📋';
    if (ext.includes('.html')) return '🌐';
    if (ext.includes('config')) return '⚙️';
    if (ext.includes('package.json')) return '📦';
    if (ext.includes('.md')) return '📝';
    return '📄';
  };

  const getFileName = (filepath: string) => {
    return filepath.split('/').pop() || filepath;
  };

  const getFileSize = (file: { size?: number }) => {
    if (!file.size) return '';
    return file.size > 1024 ? `${(file.size / 1024).toFixed(1)}KB` : `${file.size}B`;
  };

  if (files.length === 0) return null;

  const categories = showCategories ? StreamingCodeParser.categorizeFiles(files) : null;
  const completedFiles = files.filter(f => f.isComplete);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderFiles = (filesToRender: typeof files, categoryName?: string) => (
    <div className="space-y-1">
      {filesToRender.slice(0, 15).map((file, index) => (
        <div
          key={`${categoryName}-${index}`}
          className={`flex items-center gap-2 text-xs p-2 rounded transition-all duration-200 ${
            file.filename === currentFile
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : file.isComplete
              ? 'bg-green-500/10 text-green-300'
              : 'bg-slate-700/20 text-slate-400'
          }`}
        >
          <span className="text-sm flex-shrink-0">{getFileIcon(file.filename)}</span>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate" title={file.filename}>
              {getFileName(file.filename)}
            </div>
            {file.filename.includes('/') && (
              <div className="text-xs opacity-60 truncate">
                {file.filename.split('/').slice(0, -1).join('/')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {file.size && (
              <span className="text-xs opacity-70">
                {getFileSize(file)}
              </span>
            )}
            
            {file.filename === currentFile ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            ) : file.isComplete ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <Clock className="w-3 h-3 text-slate-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-green-400">Generated Files</span>
        <span className="text-xs text-slate-400">
          ({completedFiles.length}/{files.length})
        </span>
        {files.some(f => f.size) && (
          <span className="text-xs text-blue-400">
            {(files.reduce((acc, f) => acc + (f.size || 0), 0) / 1024).toFixed(1)}KB
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {showCategories && categories ? (
          <div className="space-y-2">
            {Object.entries(categories).map(([categoryName, categoryFiles]) => {
              if (categoryFiles.length === 0) return null;
              
              const isExpanded = expandedCategories.includes(categoryName);
              const categoryIcon = {
                components: '🧩',
                pages: '📄',
                utils: '🔧',
                styles: '🎨',
                config: '⚙️',
                types: '🏷️',
                other: '📁'
              }[categoryName] || '📁';

              return (
                <div key={categoryName}>
                  <button
                    onClick={() => toggleCategory(categoryName)}
                    className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors w-full text-left mb-1"
                  >
                    <span>{categoryIcon}</span>
                    <span className="capitalize">{categoryName}</span>
                    <span className="text-slate-500">({categoryFiles.length})</span>
                    <span className="ml-auto">{isExpanded ? '−' : '+'}</span>
                  </button>
                  
                  {isExpanded && renderFiles(categoryFiles, categoryName)}
                </div>
              );
            })}
          </div>
        ) : (
          renderFiles(files)
        )}
      </div>

      {currentFile && (
        <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-300">
              Generating: <span className="font-medium">{getFileName(currentFile)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};