// components/ChatPage.tsx - ENHANCED WITH VISIBLE CODE STREAMING

import React, { useEffect } from "react";
import {
  Send,
  Code,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Activity,
  Clock,
  FileText,
  Database,
  Palette,
  Monitor,
} from "lucide-react";
import { 
  StreamingCodeDisplay, 
 
} from './streaming';
import { useChatPageState, useChatPageLogic } from '../hooks/chatpage_hooks';

const ChatPage: React.FC = () => {
  
  // Use custom hooks for state and logic
  const state = useChatPageState();
  const logic = useChatPageLogic(state);

  const {
    // State
    messages,
    prompt,
    isLoading,
    previewUrl,
    error,
    projectStatus,
    isStreamingResponse,
    isServerHealthy,
    isRetrying,
    currentProject,
    isWorkflowActive,
    currentWorkflowStep,
    workflowProgress,
    workflowSteps,
    isNavigating,
    isStreamingGeneration,
    streamingProgress,
    streamingPhase,
    streamingCodeContent,
    generatedFiles,
    currentGeneratingFile,
    showCodeStream,
    currentProjectInfo,
     streamingData,
  isStreamingModification,
  isModifying
  } = state;

  const {
    // Functions
    scrollToBottom,
    clearConversation,
    stopWorkflow,
    handlePromptChange,
    handleSubmit,
    handleKeyPress,
    retryConnection,
    messagesEndRef,
    projectId,
    fromWorkflow,
    existingProject,
  } = logic;

  // Auto-scroll effect
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Determine if we should show code stream prominently
  const shouldShowCodeStream = showCodeStream && (isStreamingGeneration || !previewUrl);

  return (
    <div className="w-full bg-gradient-to-br from-black via-neutral-950 to-black h-screen flex">
      {/* Chat Section - 25% width */}
      <div className="w-1/4 flex flex-col border-r border-slate-700/50">
        {/* Header */}
        <div className="bg-slate-black/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <a href="/" className="text-xl font-semibold text-white">
                CodePup
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearConversation}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {(isStreamingGeneration || isWorkflowActive) && (
                <button
                  onClick={stopWorkflow}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                  title="Stop process"
                >
                  <Activity className="w-4 h-4" />
                </button>
              )}
              {isServerHealthy === false && (
                <button
                  onClick={retryConnection}
                  disabled={isRetrying}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                  title="Retry connection"
                >
                  {isRetrying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Progress Section */}
     {isWorkflowActive && (
  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20 p-3">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <img
          src="/main.png"
          alt="CodePup Logo"
          className="w-8 h-8 md:w-8 md:h-8 object-contain"
        />
        <span className="text-xs font-medium text-blue-400">
          APPLICATION GENERATION
        </span>
      </div>
      <span className="text-xs text-blue-300">{workflowProgress}%</span>
    </div>

    {/* Single Overall Progress Bar */}
    <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${workflowProgress}%` }}
      ></div>
    </div>

    {/* Current Step Info */}
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-medium text-purple-400">
        {currentWorkflowStep || "Initializing"}
      </span>
      {isWorkflowActive && (
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      )}
    </div>

    {/* Generated Files Display - MOVED HERE FROM MESSAGES */}
    {(isStreamingGeneration || generatedFiles.length > 0) && (
      <div className="bg-gradient-to-r from-blue-50/20 to-purple-50/20 backdrop-blur-md rounded-xl p-3 border border-blue-200/30 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">Generated Files</h3>
              <p className="text-xs text-slate-400">
                {generatedFiles.filter(f => f.isComplete).length} of {generatedFiles.length} completed
              </p>
            </div>
          </div>
          
          {/* Mini progress ring */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-600"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-400"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${(generatedFiles.filter(f => f.isComplete).length / generatedFiles.length) * 100}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {Math.round((generatedFiles.filter(f => f.isComplete).length / generatedFiles.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Compact File List - HIDDEN SCROLL */}
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto scrollbar-hide" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {generatedFiles.slice(0, 6).map((file, index) => (
            <div
              key={index}
              className={`group relative p-2 rounded-lg border transition-all duration-300 ${
                file.isComplete
                  ? 'bg-green-500/20 border-green-400/30'
                  : file.filename === currentGeneratingFile
                  ? 'bg-blue-500/20 border-blue-400/30 animate-pulse'
                  : 'bg-slate-700/20 border-slate-600/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Compact Status Icon */}
                <div className="relative">
                  {file.isComplete ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : file.filename === currentGeneratingFile ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                </div>
                
                {/* Compact File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium truncate ${
                      file.isComplete ? 'text-green-300' : 
                      file.filename === currentGeneratingFile ? 'text-blue-300' : 'text-slate-300'
                    }`}>
                      {file.filename.split('/').pop()}
                    </span>
                    
                    {/* Mini file type badge */}
                    <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${
                      file.filename.endsWith('.tsx') || file.filename.endsWith('.jsx') 
                        ? 'bg-blue-400/20 text-blue-300'
                        : file.filename.endsWith('.css')
                        ? 'bg-pink-400/20 text-pink-300'
                        : file.filename.endsWith('.json')
                        ? 'bg-yellow-400/20 text-yellow-300'
                        : 'bg-slate-400/20 text-slate-300'
                    }`}>
                      {file.filename.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Mini progress bar for current file */}
                  {file.filename === currentGeneratingFile && (
                    <div className="mt-1 w-full bg-blue-900/30 rounded-full h-1 overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  )}
                </div>
                
                {/* Status indicator */}
                <div className="text-xs">
                  {file.isComplete ? (
                    <span className="text-green-400">✓</span>
                  ) : file.filename === currentGeneratingFile ? (
                    <span className="text-blue-400">⚡</span>
                  ) : (
                    <span className="text-slate-500">⏳</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Show more indicator */}
          {generatedFiles.length > 6 && (
            <div className="text-center py-1 text-xs text-slate-400">
              ... and {generatedFiles.length - 6} more files
            </div>
          )}
        </div>
        
        {/* Current file status */}
        {currentGeneratingFile && (
          <div className="mt-2 pt-2 border-t border-slate-600/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-300">
              Creating: <span className="font-medium">{currentGeneratingFile.split('/').pop()}</span>
            </span>
          </div>
        )}
      </div>
    )}
  </div>
)}

        {/* User Info Display */}
     

        {/* Server Status */}
        {isServerHealthy === false && (
          <div className="bg-red-500/10 border-b border-red-500/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">
                SERVER OFFLINE
              </span>
            </div>
            <p className="text-xs text-red-300">
              Cannot connect to backend server
            </p>
          </div>
        )}

        {/* Messages Area */}
  
<div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4 flex flex-col">

  {/* Error Display - FIXED LAYOUT */}
  {error && (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
      <p className="text-red-400 text-sm break-words">{error}</p>
      {error.includes("Cannot connect") && (
        <button
          onClick={retryConnection}
          disabled={isRetrying}
          className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded transition-colors disabled:opacity-50"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              Retrying...
            </>
          ) : (
            "Retry Connection"
          )}
        </button>
      )}
    </div>
  )}

  {/* Messages - FIXED TEXT OVERFLOW */}
  {messages.length === 0 &&
  (projectStatus === "loading" ||
    projectStatus === "fetching" ||
    isWorkflowActive ||
    isNavigating) ? (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="p-4 bg-slate-800/30 rounded-full mb-4">
        {isWorkflowActive ? (
          <img
            src="/main.png"
            alt="CodePup Logo"
            className="w-16 h-16 md:w-8 md:h-8 object-contain"
          />
        ) : (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        )}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        {isNavigating
          ? "Preparing Workspace"
          : isWorkflowActive
          ? "Complete Application Generation"
          : projectStatus === "fetching"
          ? "Fetching Project"
          : existingProject
          ? "Loading Project"
          : "Generating Code"}
      </h3>
      <p className="text-slate-400 max-w-sm text-sm break-words">
        {isNavigating
          ? "Setting up your project workspace..."
          : isWorkflowActive
          ? `${currentWorkflowStep} • ${workflowProgress}% complete`
          : projectStatus === "fetching"
          ? "Fetching project details and deployment status..."
          : existingProject
          ? "Loading your project preview..."
          : "We are generating code files please wait"}
      </p>
      {currentProject && (
        <div className="mt-3 text-xs text-slate-500 break-all max-w-full">
          Project ID: {currentProject.id} • Status: {currentProject.status}
        </div>
      )}
    </div>
  ) : messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="p-4 bg-slate-800/30 rounded-full mb-4">
        <Code className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        Ready to Chat
      </h3>
      <p className="text-slate-400 max-w-sm text-sm break-words">
        {currentProject && currentProject.status === "ready"
          ? "Your project is ready! Start describing changes you'd like to make."
          : fromWorkflow
          ? "Complete application generation will start when you submit a prompt..."
          : "Start describing your project or changes you'd like to make"}
      </p>
      {currentProject && (
        <div className="mt-3 text-xs text-slate-500 break-all max-w-full">
          Project: {currentProject.name || currentProject.id}
        </div>
      )}
    </div>
  ) : (
    <>
   {/* UPDATE THIS SECTION - Fix colors for dark theme */}
{/* Live Streaming Display - Shows continuous data */}
{isStreamingModification && streamingData && (
  <div className="p-3 rounded-lg bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 mr-4 mb-4">
    {/* Header with live indicator */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white">🔴 Live Stream</h3>
        <p className="text-xs text-slate-300">Real-time modification progress</p>
      </div>
      <div className="text-xs text-slate-400">
        {new Date(streamingData.timestamp).toLocaleTimeString()}
      </div>
    </div>
    
    {/* Live Stream Output - Shows exactly what backend sends */}
    <div className="bg-black/60 rounded-lg p-3 font-mono text-xs">
      <div className="text-green-400 mb-2">📡 Latest Event: {streamingData.type}</div>
      
      {/* Show raw streaming data */}
      <div className="text-slate-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
        {JSON.stringify(streamingData, null, 2)}
      </div>
      
      {/* Quick status line */}
      <div className="mt-2 pt-2 border-t border-slate-600 text-blue-300">
        <div>Phase: {streamingData.phase || streamingData.type || 'Unknown'}</div>
        <div>Message: {streamingData.message || 'Processing...'}</div>
        {streamingData.percentage !== undefined && (
          <div>Progress: {Math.round(streamingData.percentage)}%</div>
        )}
        {streamingData.currentFile && (
          <div>File: {streamingData.currentFile}</div>
        )}
      </div>
    </div>
  </div>
)}
      {messages
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.type === "user"
                ? "bg-blue-600/20 ml-4"
                : "bg-slate-800/30 mr-4"
            }`}
          >
            <div className="flex items-start gap-2">
              {message.workflowStep && (
                <div className="mt-1 flex-shrink-0">
                  {message.workflowStep === "Design Generation" && (
                    <Palette className="w-3 h-3 text-blue-400" />
                  )}
                  {message.workflowStep === "Structure Planning" && (
                    <FileText className="w-3 h-3 text-green-400" />
                  )}
                  {message.workflowStep === "Backend Generation" && (
                    <Database className="w-3 h-3 text-purple-400" />
                  )}
                  {message.workflowStep === "Frontend Generation" && (
                    <Monitor className="w-3 h-3 text-orange-400" />
                  )}
                </div>
              )}
              {/* FIXED: Add proper text wrapping and overflow handling */}
              <div className="text-white text-sm flex-1 min-w-0 overflow-hidden">
                <p className="whitespace-pre-wrap break-words word-wrap-break-word overflow-wrap-anywhere">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              {message.isStreaming && (
                <Loader2 className="w-3 h-3 text-slate-400 animate-spin mt-0.5 flex-shrink-0" />
              )}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      <div ref={messagesEndRef} />
    </>
  )}
</div>

        {/* Input Area */}
        <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-slate-700/50">
          <div className="relative">
            <textarea
              className="w-full bg-black/50 border border-slate-600/50 rounded-xl text-white p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200 placeholder-slate-400 text-sm"
              value={prompt}
              onChange={handlePromptChange}
              onKeyPress={handleKeyPress}
              placeholder={
                isServerHealthy === false
                  ? "Server offline..."
                  : isWorkflowActive || isStreamingGeneration
                  ? "Workflow in progress..."
                   : isModifying || isStreamingModification    // ADD THIS
      ? "Modification in progress..."    
                  : "Describe your project or changes..."
              }
              rows={2}
              disabled={
                isLoading ||
                projectStatus === "loading" ||
                projectStatus === "fetching" ||
                isStreamingResponse ||
                isStreamingGeneration ||
                isWorkflowActive ||
                isNavigating ||
                isServerHealthy === false  ||  
                  isModifying ||                   
    isStreamingModification   
              }
              maxLength={1000}
            />
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                projectStatus === "loading" ||
                projectStatus === "fetching" ||
                isStreamingResponse ||
                isStreamingGeneration ||
                isWorkflowActive ||
                isNavigating ||
                isServerHealthy === false ||
    isModifying ||                    // ADD THIS
    isStreamingModification   
              }
              className="absolute bottom-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            >
              {isLoading ||
              isStreamingResponse ||
              isStreamingGeneration ||
              isWorkflowActive ||  
               isModifying ||                     
  isStreamingModification ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>
              {isServerHealthy === false
                ? "Server offline - check connection"
                : isWorkflowActive || isStreamingGeneration
                ? "Complete workflow in progress..."
                : "Enter to send, Shift+Enter for new line"}
            </span>
            <span>{prompt.length}/1000</span>
          </div>
        </div>
      </div>

      {/* Preview Section - 75% width */}
      <div className="w-3/4 flex flex-col bg-slate-900/50">
        {/* Preview Header */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live Preview</h2>
            <div className="flex items-center gap-4">
              {/* Workflow Status Indicator */}
              {isWorkflowActive && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-blue-400">
                    {isStreamingGeneration
                      ? `Streaming ${streamingPhase}`
                      : `Workflow ${currentWorkflowStep}`}
                  </span>
                  <span className="text-slate-400">
                    {isStreamingGeneration
                      ? `${streamingProgress.toFixed(0)}%`
                      : `${workflowProgress}%`}
                  </span>
                </div>
              )}

              {/* Code Stream Status */}
              {shouldShowCodeStream && (
                <div className="flex items-center gap-2 text-xs">
                  <Code className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Code Generation</span>
                  <span className="text-slate-400">
                    {generatedFiles.filter(f => f.isComplete).length}/{generatedFiles.length} files
                  </span>
                </div>
              )}

              {(projectId || currentProjectInfo.id) && (
                <span className="text-xs text-slate-400">
                  Project: {projectId || currentProjectInfo.id}
                </span>
              )}
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in new tab
                </a>
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isServerHealthy === false
                      ? "bg-red-500"
                      : isWorkflowActive || isStreamingGeneration
                      ? "bg-blue-500 animate-pulse"
                      : projectStatus === "ready"
                      ? "bg-green-500"
                      : projectStatus === "loading" ||
                        projectStatus === "fetching"
                      ? "bg-yellow-500"
                      : projectStatus === "error"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-xs text-slate-400 capitalize">
                  {isServerHealthy === false
                    ? "offline"
                    : isWorkflowActive
                    ? "workflow"
                    : isStreamingGeneration
                    ? "streaming"
                    : projectStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
<div className="flex-1 p-4">
  <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden relative">
    
    {/* Preview iframe - Always show when available */}
    {previewUrl && (
      <iframe
        src={previewUrl}
        className="w-full h-full absolute inset-0 z-10"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onError={(e) => {
          console.error("Iframe load error:", e);
          state.setError(
            "Failed to load preview. The deployment might not be ready yet."
          );
        }}
      />
    )}

    {/* 4-Part Workflow Display - ABOVE EVERYTHING IN PREVIEW */}
    {isWorkflowActive && (
  <div className="absolute top-16 right-6 z-30 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 shadow-xl min-w-80">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Application Generation</h3>
              <p className="text-xs text-gray-600">Building your complete app</p>
            </div>
          </div>

          {/* 4 Workflow Steps */}
          <div className="space-y-3">
            {[
              { 
                name: "Design Generation", 
                icon: "🎨", 
                description: "Creating design system"
              },
              { 
                name: "Structure Planning", 
                icon: "📋", 
                description: "Planning file structure"
              },
              { 
                name: "Backend Generation", 
                icon: "🔧", 
                description: "Building server & database"
              },
              { 
                name: "Frontend Generation", 
                icon: "⚛️", 
                description: "Creating user interface"
              },
            ].map((step) => {
              const stepData = workflowSteps.find(s => s.step === step.name);
              const isActive = currentWorkflowStep === step.name;
              const isComplete = stepData?.isComplete;
              const hasError = stepData?.error;

              return (
                <div
                  key={step.name}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    hasError
                      ? "bg-red-50 border border-red-200"
                      : isComplete
                      ? "bg-green-50 border border-green-200"
                      : isActive
                      ? "bg-blue-50 border border-blue-200 animate-pulse"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {/* Step Icon */}
                  <div className={`text-2xl ${isActive ? 'animate-bounce' : ''}`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${
                        hasError ? 'text-red-700' :
                        isComplete ? 'text-green-700' :
                        isActive ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {step.name}
                      </h4>
                      
                      {/* Progress indicator for active step */}
                      {isActive && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {workflowProgress}%
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${
                      hasError ? 'text-red-600' :
                      isComplete ? 'text-green-600' :
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {hasError ? `Error: ${stepData?.error}` :
                       isComplete ? 'Completed successfully' :
                       isActive ? step.description : step.description}
                    </p>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {hasError ? (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : isComplete ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Progress */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Overall Progress</span>
              <span className="text-xs font-bold text-blue-600">{workflowProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${workflowProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Streaming Overlay - Shows on top when active with 95% opacity */}
    {(showCodeStream && isStreamingGeneration) && (
      <div className="absolute inset-0 z-20 bg-black/5 backdrop-blur-[1px]">
        <div className="w-full h-full bg-white/95 overflow-hidden">
          <StreamingCodeDisplay
            content={streamingCodeContent}
            isStreaming={isStreamingGeneration}
            files={generatedFiles}
            currentFile={currentGeneratingFile}
            progress={streamingProgress}
          />
        </div>
      </div>
    )}

    {/* Placeholder when no preview and no streaming */}
    {!previewUrl && !isStreamingGeneration && (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
        {/* Your existing placeholder content */}
        {(isWorkflowActive || isStreamingGeneration) && (
          <div className="mb-8 z-30">
            <img
              src="/main.png"
              alt="CodePup Logo"
              className="w-24 h-24 md:w-32 md:h-32 object-contain puppy-float mx-auto"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
              }}
            />
          </div>
        )}

        <div className="text-center max-w-md px-4">
          {!isWorkflowActive && !isStreamingGeneration && (
            <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              {isServerHealthy === false ? (
                <AlertCircle className="w-8 h-8 text-red-400" />
              ) : projectStatus === "loading" ||
                projectStatus === "fetching" ? (
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              ) : (
                <Code className="w-8 h-8 text-slate-400" />
              )}
            </div>
          )}
          
          <p className="text-slate-600 mb-4 text-sm leading-relaxed break-words">
            {isServerHealthy === false
              ? "Server offline"
              : isWorkflowActive
              ? `${currentWorkflowStep} (${workflowProgress}%)`
              : isStreamingGeneration
              ? `${streamingPhase} (${streamingProgress.toFixed(0)}%)`
              : projectStatus === "fetching"
              ? "Fetching project..."
              : projectStatus === "loading"
              ? existingProject
                ? "Loading preview..."
                : "Generating preview..."
              : projectStatus === "error"
              ? "Failed to load preview"
              : currentProject?.status === "building"
              ? "Building project..."
              : currentProject?.status === "pending"
              ? "Build pending..."
              : fromWorkflow
              ? "Starting automatically..."
              : "Preview will appear here"}
          </p>

                  {/* Additional Status Information - SIMPLIFIED */}
                  {isWorkflowActive && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-500 truncate">
                        {currentWorkflowStep}
                      </div>
                      <div className="w-full bg-slate-300 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${workflowProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isStreamingGeneration && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-500 truncate">
                        {streamingPhase}
                      </div>
                      {generatedFiles.length > 0 && (
                        <div className="text-xs text-slate-400 truncate">
                          {generatedFiles.filter(f => f.isComplete).length}/{generatedFiles.length} files
                        </div>
                      )}
                      <div className="w-full bg-slate-300 rounded-full h-1">
                        <div
                          className="bg-green-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${streamingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;