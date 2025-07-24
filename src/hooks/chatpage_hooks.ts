// hooks/useChatPage.ts - ENHANCED WITH VISIBLE CODE STREAMING

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { StreamingCodeParser } from '../pages/streaming';
import type {
  Project,
  Message,
  WorkflowStepData,
  StreamingProgressData,
  StreamingStats,
  GeneratedFile,
  ProjectInfo,
  LocationState
} from '../types/index';

export const useChatPageState = () => {
  // Basic states
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [projectStatus, setProjectStatus] = useState<
    "idle" | "loading" | "ready" | "error" | "fetching"
  >("idle");
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [isServerHealthy, setIsServerHealthy] = useState<boolean | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isModifying,setIsModifying] = useState(false);
  const [modificationHistory,setModificationHistory] = useState<string[]>([]);
   const [canModify, setCanModify] = useState(false);
const [showModificationPanel, setShowModificationPanel] = useState(false);
  // Workflow states
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<string>("");
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepData[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Streaming states
  const [streamingData, setStreamingData] = useState<any>(null);
const [isStreamingModification, setIsStreamingModification] = useState(false);
  const [isStreamingGeneration, setIsStreamingGeneration] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [streamingPhase, setStreamingPhase] = useState<string>("");
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    totalCharacters: 0,
    chunksReceived: 0,
    estimatedTotalChunks: 0,
    startTime: 0,
  });
  const [showStreamingDetails, setShowStreamingDetails] = useState(false);

  // Enhanced streaming code states
  const [streamingCodeContent, setStreamingCodeContent] = useState<string>("");
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [currentGeneratingFile, setCurrentGeneratingFile] = useState<string>();
  const [showCodeStream, setShowCodeStream] = useState(false);
  const [accumulatedCodeContent, setAccumulatedCodeContent] = useState<string>("");

  // Project states
  const [currentProjectInfo, setCurrentProjectInfo] = useState<ProjectInfo>({
    id: null,
    name: null,
    isVerified: false,
  });

  return {
    // Basic states
    messages, setMessages,
    prompt, setPrompt,
    isLoading, setIsLoading,
    previewUrl, setPreviewUrl,
    error, setError,
    projectStatus, setProjectStatus,
    isStreamingResponse, setIsStreamingResponse,
    isServerHealthy, setIsServerHealthy,
    isRetrying, setIsRetrying,
    currentProject, setCurrentProject,

    // Workflow states
    isWorkflowActive, setIsWorkflowActive,
    currentWorkflowStep, setCurrentWorkflowStep,
    workflowProgress, setWorkflowProgress,
    workflowSteps, setWorkflowSteps,
    isNavigating, setIsNavigating,

    // Streaming states
    isStreamingGeneration, setIsStreamingGeneration,
    streamingProgress, setStreamingProgress,
    streamingPhase, setStreamingPhase,
    streamingMessage, setStreamingMessage,
    streamingStats, setStreamingStats,
    showStreamingDetails, setShowStreamingDetails,

    // Enhanced streaming code states
    streamingCodeContent, setStreamingCodeContent,
    generatedFiles, setGeneratedFiles,
    currentGeneratingFile, setCurrentGeneratingFile,
    showCodeStream, setShowCodeStream,
    accumulatedCodeContent, setAccumulatedCodeContent,

    // Project states
    currentProjectInfo, setCurrentProjectInfo,
      isModifying, setIsModifying,
    canModify, setCanModify,
    modificationHistory, setModificationHistory,
    showModificationPanel, setShowModificationPanel,
      streamingData, setStreamingData,
    isStreamingModification, setIsStreamingModification,
  };
};

export const useChatPageLogic = (state: ReturnType<typeof useChatPageState>) => {
  const {
    setMessages,
    setWorkflowSteps,
    setCurrentWorkflowStep,
    setStreamingProgress,
    setStreamingPhase,
    setStreamingMessage,
    setAccumulatedCodeContent,
    setGeneratedFiles,
    setCurrentGeneratingFile,
    setStreamingCodeContent,
    setShowCodeStream,
  
    setStreamingStats,
    setPreviewUrl,
    setProjectStatus,
    setIsStreamingGeneration,
    setIsWorkflowActive,
    setWorkflowProgress,
    setCurrentProjectInfo,
    setCurrentProject,
    setError,
    setIsServerHealthy,
    setIsLoading,
    setPrompt,
    setIsRetrying,
    setIsNavigating,
    streamingStats,
    workflowSteps,
    currentWorkflowStep,
    prompt,
    isLoading,
    isStreamingGeneration,
    isWorkflowActive,
    projectStatus,
    isServerHealthy,
    showCodeStream,
    previewUrl,
    streamingProgress,
      isModifying, setIsModifying,
  canModify, setCanModify,
  modificationHistory, setModificationHistory,
  showModificationPanel, setShowModificationPanel,
streamingData, setStreamingData,  // ✅ Add this
  isStreamingModification, setIsStreamingModification,   
  } = state;

  // Refs
  const hasInitialized = useRef(false);
  const isGenerating = useRef(false);
  const currentProjectId = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectLoaded = useRef(false);
  const healthCheckDone = useRef(false);
  
  // PERFORMANCE: Add throttling refs
  const lastChunkProcessTime = useRef(0);
  const chunkProcessingQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  const location = useLocation();
  const {
    prompt: navPrompt,
    projectId,
    existingProject,
    supabaseConfig,
    clerkId,
    userId: passedUserId,
    fromWorkflow,
  } = (location.state as LocationState) || {};

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Get current user ID
  const getCurrentUserId = useCallback((): number => {
    if (passedUserId) {
      return passedUserId;
    }

    const storedDbUser = localStorage.getItem("dbUser");
    if (storedDbUser) {
      try {
        const parsedUser = JSON.parse(storedDbUser);
        return parsedUser.id;
      } catch (e) {
        console.warn("Failed to parse stored dbUser");
      }
    }

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && !isNaN(parseInt(storedUserId))) {
      return parseInt(storedUserId);
    }

    return 1;
  }, [passedUserId]);
// In hooks/useChatPage.ts
// FIND your existing sendModificationRequest function and REPLACE it with this:

const sendModificationRequest = useCallback(async (modificationPrompt: string) => {
  if (!projectId || !modificationPrompt.trim()) return;
  
  setIsModifying(true);
  setIsStreamingModification(true);  // NEW
  setStreamingData(null);            // NEW
  setError("");
  
  try {
    console.log("🚀 Starting streaming modification request");
    
    const response = await fetch(`${baseUrl}/api/modify/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: modificationPrompt,
        userId: getCurrentUserId(),
        deployedUrl: previewUrl,
        projectId: projectId,
        clerkId: clerkId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ") && lines[lines.indexOf(line) + 1]?.startsWith("data: ")) {
          const eventType = line.slice(7).trim();
          const dataLine = lines[lines.indexOf(line) + 1];
          
          try {
            const eventData = JSON.parse(dataLine.slice(6));
            console.log(`📡 Streaming Event [${eventType}]:`, eventData);
            
            // Update streaming data for display
            setStreamingData({
              type: eventType,
              ...eventData,
              timestamp: new Date().toISOString()
            });
            
            // Handle different events
            if (eventType === 'complete') {
              setIsStreamingModification(false);
              setIsModifying(false);
              
              // Update preview URL if new one is provided - THIS IS KEY FOR NEW DEPLOYMENT URL
              if (eventData.data?.newDeploymentUrl || eventData.data?.previewUrl) {
                const newUrl = eventData.data.newDeploymentUrl || eventData.data.previewUrl;
                setPreviewUrl(newUrl);
                console.log("🆕 NEW DEPLOYMENT URL:", newUrl);
              }
              
              // Add success message
              const successMessage: Message = {
                id: `mod-success-${Date.now()}`,
                content: `✅ **Modification Complete!**\n\n🌐 **New Deployment**: [${eventData.data?.newDeploymentUrl || eventData.data?.previewUrl}](${eventData.data?.newDeploymentUrl || eventData.data?.previewUrl})\n\n📊 **Files Modified**: ${eventData.data?.totalModifiedFiles || 0}\n📁 **Files Added**: ${eventData.data?.totalAddedFiles || 0}`,
                type: "assistant",
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, successMessage]);
              
            } else if (eventType === 'error') {
              setIsStreamingModification(false);
              setIsModifying(false);
              setError(eventData.error || "Modification failed");
            }
            
          } catch (e) {
            console.warn("Error parsing streaming data:", e);
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Streaming modification failed:", error);
    setError("Failed to apply modification");
    setIsStreamingModification(false);
    setIsModifying(false);
  }
}, [
  projectId,
  baseUrl,
  getCurrentUserId,
  previewUrl,
  clerkId,
  setIsModifying,
  setIsStreamingModification,   // NEW DEPENDENCY
  setStreamingData,             // NEW DEPENDENCY
  setError,
  setPreviewUrl,
  setMessages
]);
  // ENHANCED: Add function to control code stream visibility
  const toggleCodeStreamVisibility = useCallback((forceShow?: boolean) => {
    if (forceShow !== undefined) {
      setShowCodeStream(forceShow);
    } else {
      setShowCodeStream(prev => !prev);
    }
  }, [setShowCodeStream]);

  // ENHANCED: Add function to determine if code stream should be main content
  const shouldShowCodeStreamAsMain = useCallback(() => {
    return (
      showCodeStream && 
      (isStreamingGeneration || !previewUrl || streamingProgress < 100)
    );
  }, [showCodeStream, isStreamingGeneration, previewUrl, streamingProgress]);

  // Add workflow step
  const addWorkflowStep = useCallback((stepData: WorkflowStepData) => {
    setWorkflowSteps((prev) => [...prev, stepData]);
    setCurrentWorkflowStep(stepData.step);

    const stepMessage: Message = {
      id: `workflow-${Date.now()}`,
      content: `**${stepData.step}**: ${stepData.message}`,
      type: "assistant",
      timestamp: new Date(),
      workflowStep: stepData.step,
      stepData: stepData.data,
    };

    setMessages((prev) => [...prev, stepMessage]);
  }, [setWorkflowSteps, setCurrentWorkflowStep, setMessages]);

  // Update workflow step
  const updateWorkflowStep = useCallback(
    (step: string, updates: Partial<WorkflowStepData>) => {
      setWorkflowSteps((prev) =>
        prev.map((s) => (s.step === step ? { ...s, ...updates } : s))
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.workflowStep === step
            ? {
                ...msg,
                content: `**${step}**: ${
                  updates.message || msg.content.split(": ")[1]
                }`,
              }
            : msg
        )
      );
    },
    [setWorkflowSteps, setMessages]
  );

  // ENHANCED: Reset streaming state with better control
  const resetStreamingState = useCallback(() => {
    setStreamingCodeContent("");
    setAccumulatedCodeContent("");
    setGeneratedFiles([]);
    setCurrentGeneratingFile(undefined);
    
    // Don't immediately hide code stream - let it fade naturally
    setTimeout(() => {
      setShowCodeStream(false);
    }, 1000);
    
    // Clear processing queue
    chunkProcessingQueue.current = [];
    isProcessingQueue.current = false;
  }, [
    setStreamingCodeContent,
    setAccumulatedCodeContent,
    setGeneratedFiles,
    setCurrentGeneratingFile,
    setShowCodeStream,
  ]);

  // ENHANCED: Improved chunk processing for better file display
  const processChunkQueue = useCallback(async () => {
    if (isProcessingQueue.current || chunkProcessingQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    
    try {
      while (chunkProcessingQueue.current.length > 0) {
        const chunk = chunkProcessingQueue.current.shift();
        if (!chunk) continue;

        // Parse streaming chunk to extract files
        const parsed = StreamingCodeParser.parseStreamingChunk(chunk);
        
        // Update generated files with proper formatting
        if (parsed.files.length > 0) {
          setGeneratedFiles(parsed.files.map(f => ({
            filename: f.filename,
            content: f.content,
            isComplete: f.isComplete,
            size: f.size || f.content.length,
            type: 'file'
          })));
        }
        
        // Update current generating file
        if (parsed.currentFile) {
          setCurrentGeneratingFile(parsed.currentFile);
        }
        
        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.warn("Error processing chunk queue:", error);
    } finally {
      isProcessingQueue.current = false;
    }
  }, [setGeneratedFiles, setCurrentGeneratingFile]);

  // ENHANCED: Streaming data handler with prominent code display
  const handleStreamingData = useCallback(
    (data: StreamingProgressData, projId: number) => {
      console.log("📡 Streaming data received:", data.type, data.message);

      switch (data.type) {
        case "progress":
          setStreamingProgress(data.percentage || 0);
          setStreamingPhase(data.phase || "");
          setStreamingMessage(data.message || "");

          updateWorkflowStep("Frontend Generation", {
            message: `${data.message} (${(data.percentage || 0).toFixed(0)}%)`,
            isComplete: false,
          });

          // ENHANCED: Show code stream prominently during generation
          if (data.phase === "processing" || data.phase === "parsing" || data.phase === "generating") {
            console.log("🎨 Starting prominent code stream display");
            setShowCodeStream(true);
          } else if (data.phase === "complete") {
            console.log("✅ Generation complete, keeping stream visible for review");
            // Keep visible longer for final review
            setTimeout(() => {
              // Only hide if we have a preview URL, otherwise keep showing code
              if (data.result?.previewUrl) {
                setShowCodeStream(false);
              }
            }, 5000); // 5 seconds instead of 3
          }
          break;

        case "length":
          setStreamingStats((prev) => ({
            ...prev,
            totalCharacters: data.currentLength || 0,
            bytesPerSecond: prev.startTime
              ? (data.currentLength || 0) / ((Date.now() - prev.startTime) / 1000)
              : 0,
          }));
          setStreamingProgress(data.percentage || 0);
          break;

        case "chunk":
          if (data.chunk) {
            console.log("📦 Processing chunk:", data.chunk.length, "characters");
            
            // ENHANCED: Ensure code stream is prominently visible when receiving chunks
            setShowCodeStream(true);
            
            // Throttle chunk processing for performance - reduced for more responsive updates
            const now = Date.now();
            if (now - lastChunkProcessTime.current > 100) { // Reduced from 150ms to 100ms
              lastChunkProcessTime.current = now;
              
              setAccumulatedCodeContent(prev => {
                const newContent = prev + data.chunk;
                
                // Update streaming code content for display
                setStreamingCodeContent(newContent);
                
                // Add to processing queue for file parsing
                chunkProcessingQueue.current.push(newContent);
                
                // Process queue asynchronously
                setTimeout(processChunkQueue, 0);
                
                return newContent;
              });

              setStreamingStats((prev) => ({
                ...prev,
                chunksReceived: prev.chunksReceived + 1,
                totalCharacters: data.currentLength || prev.totalCharacters,
                estimatedTotalChunks: Math.ceil((data.totalLength || 0) / 1000),
              }));
            }
          }
          break;

        case "complete":
          setStreamingProgress(100);
          setStreamingPhase("complete");
          setStreamingMessage(data.message || "Application creation completed!");
          
          // ENHANCED: Keep showing stream for final review, then transition to preview
          console.log("🎉 Generation complete - showing final result");
          
          // Keep stream visible longer for user to see completion
          setTimeout(() => {
            // Only hide if we have a preview URL, otherwise keep showing code
            if (data.result?.previewUrl) {
              setShowCodeStream(false);
            }
            setStreamingCodeContent("");
            setAccumulatedCodeContent("");
          }, 6000); // Increased to 6 seconds
          
          setStreamingStats((prev) => ({
            ...prev,
            endTime: Date.now(),
          }));
          break;

        case "result":
          if (data.result) {
            setPreviewUrl(data.result.previewUrl);
            setProjectStatus("ready");
            setIsStreamingGeneration(false);
            setIsWorkflowActive(false);
            setWorkflowProgress(100);
            
            // Final files display
            if (data.result.files) {
              const finalFiles = data.result.files.map((file: any) => ({
                filename: file.path || file.filename,
                content: file.content || '',
                isComplete: true,
                size: file.content ? file.content.length : 0,
                type: 'file'
              }));
              setGeneratedFiles(finalFiles);
              console.log("📁 Final files set:", finalFiles.length, "files");
            }
            setCanModify(true);
            updateWorkflowStep("Frontend Generation", {
              message: `✅ Application deployed successfully! ${
                data.result.files?.length || 0
              } files generated`,
              isComplete: true,
              data: data.result,
            });

            const completionMessage: Message = {
              id: `completion-${Date.now()}`,
              content: `🎉 **Application Created Successfully!**

**📊 Generation Summary:**
- **Design Files**: Created with modern styling and configuration
- **File Structure**: ${data.result.structure?.fileCount || "Multiple"} files organized  
- **Backend**: Database schema and API endpoints generated
- **Frontend**: ${data.result.files?.length || 0} React components created
- **Deployment**: Live application deployed successfully

**🚀 Your Application:**
- **Live URL**: [View Application](${data.result.previewUrl})
- **Download**: [Source Code](${data.result.downloadUrl})
- **Framework**: React + TypeScript + Vite
- **Styling**: Modern CSS with responsive design
- **Database**: Configured with migrations
- **Hosting**: Production-ready deployment

**✨ Features:**
- Fast loading with optimized assets
- Secure HTTPS connection
- Mobile-responsive design
- Database integration ready

Your application is now live and ready to use!`,
              type: "assistant",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, completionMessage]);

            if (data.result.projectId) {
              setCurrentProjectInfo({
                id: data.result.projectId,
                name: `Generated Application`,
                isVerified: true,
              });
              setCurrentProject({
                id: data.result.projectId,
                name: `Complete Application`,
                deploymentUrl: data.result.previewUrl,
                status: "ready",
              });
            }

            // Hide code stream after showing result - only if preview is available
            setTimeout(() => {
              if (data.result.previewUrl) {
                setShowCodeStream(false);
              }
            }, 3000);
          }
          break;

        case "error":
          setError(data.error || "Application generation failed");
          setIsStreamingGeneration(false);
          setIsWorkflowActive(false);
          setProjectStatus("error");
          setShowCodeStream(false);

          updateWorkflowStep("Frontend Generation", {
            message: `❌ Failed: ${data.error || "Unknown error"}`,
            isComplete: true,
            error: data.error || "Unknown error",
          });
          break;
      }
    },
    [updateWorkflowStep, setStreamingProgress, setStreamingPhase, setStreamingMessage, 
     setAccumulatedCodeContent, setGeneratedFiles, setCurrentGeneratingFile, 
     setStreamingCodeContent, setShowCodeStream, setStreamingStats, setPreviewUrl,
     setProjectStatus, setIsStreamingGeneration, setIsWorkflowActive, setWorkflowProgress,
     setCurrentProjectInfo, setCurrentProject, setError, setMessages, processChunkQueue]
  );

  // Check server health
  const checkServerHealth = useCallback(async () => {
    if (healthCheckDone.current) {
      return isServerHealthy;
    }

    try {
      const healthResponse = await axios.get(`${baseUrl}/health`, {
        timeout: 10000,
      });
      setIsServerHealthy(true);
      setError("");
      healthCheckDone.current = true;
      return true;
    } catch (error) {
      setIsServerHealthy(false);
      healthCheckDone.current = true;

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
          setError(
            "Backend server is not responding. Please ensure it's running on the correct port."
          );
        } else {
          setError(`Server error: ${error.response?.status || "Unknown"}`);
        }
      } else {
        setError("Cannot connect to server");
      }
      return false;
    }
  }, [baseUrl, isServerHealthy, setIsServerHealthy, setError]);

  // Load project
const loadProject = useCallback(
  async (projId: number) => {
    if (currentProjectId.current === projId && projectStatus !== "idle") {
      return;
    }

    console.log(`📂 Loading project ${projId}...`);
    setError("");
    setProjectStatus("fetching");
    currentProjectId.current = projId;

    try {
      const res = await axios.get<Project>(`${baseUrl}/api/projects/${projId}`);
      const project = res.data;

      console.log(`📂 Project ${projId} loaded:`, project);
      setCurrentProject(project);
      setCurrentProjectInfo({
        id: projId,
        name: project.name || `Project ${projId}`,
        isVerified: true,
      });

      if (project.deploymentUrl) {
        setPreviewUrl(project.deploymentUrl);
        setProjectStatus("ready");
        setCanModify(true);
        console.log("🔧 Setting canModify to TRUE for project with deploymentUrl:", project.deploymentUrl); // DEBUG LOG
      } else {
        setProjectStatus("idle");
        console.log("🔧 NOT setting canModify - no deploymentUrl. Project:", project); // DEBUG LOG
      }
    } catch (error) {
      console.error(`❌ Failed to load project ${projId}:`, error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError(`Project with ID ${projId} not found.`);
      } else {
        setError("Failed to load project");
      }
      setProjectStatus("error");
    }
  },
  [baseUrl, projectStatus, setError, setProjectStatus, setCurrentProject, 
   setCurrentProjectInfo, setPreviewUrl, setCanModify]
);

  // Load project messages
  const loadProjectMessages = useCallback(
    async (projectId: number) => {
      if (projectLoaded.current) {
        return;
      }

      console.log(`📨 Loading messages for project ${projectId}...`);
      try {
        const response = await axios.get(`${baseUrl}/api/messages/project/${projectId}`);

        if (response.data.success && response.data.data) {
          const history = response.data.data;
          const formattedMessages: Message[] = history.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            content: msg.content,
            type: msg.role === "user" ? "user" : "assistant",
            timestamp: new Date(msg.createdAt || msg.timestamp),
          }));

          setMessages(formattedMessages);
          console.log(`📨 Loaded ${formattedMessages.length} messages for project ${projectId}`);
        } else {
          setMessages([]);
        }
        projectLoaded.current = true;
      } catch (error) {
        console.warn(`⚠️ Could not load messages for project ${projectId}:`, error);
        setMessages([]);
        projectLoaded.current = true;
      }
    },
    [baseUrl, setMessages]
  );

  // ENHANCED: Optimized streaming frontend generation
  const startStreamingFrontendGeneration = useCallback(
    async (projId: number) => {
      console.log("🎨 Starting streaming frontend generation...");
      
      setIsStreamingGeneration(true);
      setStreamingProgress(0);
      setStreamingPhase("initializing");
      setStreamingMessage("Starting application generation...");
      
      // Clear previous state and show code stream immediately
      setStreamingCodeContent("");
      setAccumulatedCodeContent("");
      setGeneratedFiles([]);
      setCurrentGeneratingFile(undefined);
      setShowCodeStream(true); // Show immediately
      
      setStreamingStats({
        totalCharacters: 0,
        chunksReceived: 0,
        estimatedTotalChunks: 0,
        startTime: Date.now(),
      });

      try {
        console.log(`🎨 Starting streaming generation for project ${projId}`);

        if (!supabaseConfig) {
          throw new Error("Supabase configuration is missing");
        }

        const response = await fetch(`${baseUrl}/api/design/generate-frontend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projId,
            supabaseUrl: supabaseConfig.supabaseUrl,
            supabaseAnonKey: supabaseConfig.supabaseAnonKey,
            supabaseToken: supabaseConfig.supabaseToken,
            databaseUrl: supabaseConfig.databaseUrl,
            userId: getCurrentUserId(),
            clerkId: clerkId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let chunkCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data: StreamingProgressData = JSON.parse(line.slice(6));
                
                // Process streaming data with proper throttling
                chunkCount++;
                if (chunkCount % 2 === 0 || data.type === "chunk" || data.type === "result") {
                  handleStreamingData(data, projId);
                }
              } catch (e) {
                console.warn("Error parsing streaming data:", e);
              }
            }
          }
          
          // Performance throttling
          if (chunkCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        console.log("✅ Streaming frontend generation completed");
      } catch (error) {
        console.error("❌ Streaming frontend generation failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Application generation failed";
        setError(errorMessage);
        setIsStreamingGeneration(false);
        setIsWorkflowActive(false);
        setProjectStatus("error");
        setShowCodeStream(false);

        updateWorkflowStep("Frontend Generation", {
          message: `❌ Failed: ${errorMessage}`,
          isComplete: true,
          error: errorMessage,
        });
      }
    },
    [baseUrl, supabaseConfig, getCurrentUserId, clerkId, updateWorkflowStep, handleStreamingData,
     setIsStreamingGeneration, setStreamingProgress, setStreamingPhase, setStreamingMessage,
     setStreamingStats, setError, setIsWorkflowActive, setProjectStatus, setStreamingCodeContent,
     setAccumulatedCodeContent, setGeneratedFiles, setCurrentGeneratingFile, setShowCodeStream]
  );

  // Continue with other functions...
  const startCompleteWorkflow = useCallback(
    async (userPrompt: string, projId: number) => {
      console.log(`🚀 Starting complete workflow for project ${projId} with prompt: "${userPrompt}"`);

      if (isWorkflowActive || isGenerating.current) {
        console.log("🔄 Workflow already in progress, skipping...");
        return;
      }

      if (!supabaseConfig || !supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
        setError("Supabase configuration is missing. Please ensure backend is properly configured.");
        return;
      }

      resetStreamingState();

      setIsWorkflowActive(true);
      setIsLoading(true);
      setError("");
      setProjectStatus("loading");
      setWorkflowProgress(0);
      setWorkflowSteps([]);
      isGenerating.current = true;

      try {
        // Step 1: Generate design files
        addWorkflowStep({
          step: "Design Generation",
          message: "Creating design files and structure...",
          isComplete: false,
        });
        setWorkflowProgress(20);

        const generateResponse = await axios.post(`${baseUrl}/api/design/generate`, {
          projectId: projId,
          prompt: userPrompt,
        });

        if (!generateResponse.data.success) {
          throw new Error(generateResponse.data.error || "Failed to generate design files");
        }

        updateWorkflowStep("Design Generation", {
          message: `✅ Generated ${
            generateResponse.data.files ? Object.keys(generateResponse.data.files).length : 0
          } design files successfully!`,
          isComplete: true,
          data: generateResponse.data,
        });
        setWorkflowProgress(40);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 2: Plan structure
        addWorkflowStep({
          step: "Structure Planning",
          message: "Planning file structure and documentation...",
          isComplete: false,
        });

        const planResponse = await axios.post(`${baseUrl}/api/design/plan-structure`, {
          projectId: projId,
        });

        if (!planResponse.data.success) {
          throw new Error(planResponse.data.error || "Failed to plan structure");
        }

        updateWorkflowStep("Structure Planning", {
          message: `✅ Planned structure with ${planResponse.data.totalFileCount || 0} files!`,
          isComplete: true,
          data: planResponse.data,
        });
        setWorkflowProgress(60);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 3: Generate backend
        addWorkflowStep({
          step: "Backend Generation",
          message: "Generating backend files, database schema, and API endpoints...",
          isComplete: false,
        });

        const backendResponse = await axios.post(`${baseUrl}/api/design/generate-backend`, {
          projectId: projId,
        });

        if (!backendResponse.data.success) {
          throw new Error(backendResponse.data.error || "Failed to generate backend");
        }

        updateWorkflowStep("Backend Generation", {
          message: `✅ Generated backend with database schema and ${
            backendResponse.data.files ? Object.keys(backendResponse.data.files).length : 0
          } files!`,
          isComplete: true,
          data: backendResponse.data,
        });
        setWorkflowProgress(80);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 4: Generate frontend (streaming)
        addWorkflowStep({
          step: "Frontend Generation",
          message: "Starting frontend generation with live deployment...",
          isComplete: false,
        });

        await startStreamingFrontendGeneration(projId);
      } catch (error) {
        console.error("❌ Workflow failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Workflow failed";
        setError(errorMessage);
        setIsWorkflowActive(false);
        setProjectStatus("error");

        if (currentWorkflowStep) {
          updateWorkflowStep(currentWorkflowStep, {
            message: `❌ Failed: ${errorMessage}`,
            isComplete: true,
            error: errorMessage,
          });
        }
      } finally {
        isGenerating.current = false;
        setIsLoading(false);
      }
    },
    [isWorkflowActive, addWorkflowStep, updateWorkflowStep, currentWorkflowStep, baseUrl,
     supabaseConfig, resetStreamingState, setIsWorkflowActive, setIsLoading, setError,
     setProjectStatus, setWorkflowProgress, setWorkflowSteps, startStreamingFrontendGeneration]
  );

  // Utility functions
  const clearConversation = useCallback(async () => {
    if (projectId) {
      try {
        await axios.delete(`${baseUrl}/api/messages/project/${projectId}`);
        setMessages([]);
        setWorkflowSteps([]);
        setIsWorkflowActive(false);
        setWorkflowProgress(0);
        resetStreamingState();
      } catch (error) {
        setError("Failed to clear conversation");
      }
    } else {
      setMessages([]);
      setWorkflowSteps([]);
      setIsWorkflowActive(false);
      setWorkflowProgress(0);
      resetStreamingState();
    }
  }, [baseUrl, projectId, resetStreamingState, setMessages, setWorkflowSteps, 
      setIsWorkflowActive, setWorkflowProgress, setError]);

  const stopWorkflow = useCallback(() => {
    setIsWorkflowActive(false);
    setIsStreamingGeneration(false);
    isGenerating.current = false;
    setStreamingPhase("stopped");
    setStreamingMessage("Process stopped by user");
    setShowCodeStream(false);

    if (currentWorkflowStep) {
      updateWorkflowStep(currentWorkflowStep, {
        message: "⏹️ Process stopped by user",
        isComplete: true,
      });
    }
  }, [currentWorkflowStep, updateWorkflowStep, setIsWorkflowActive, 
      setIsStreamingGeneration, setStreamingPhase, setStreamingMessage, setShowCodeStream]);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    [setPrompt]
  );
// Add this useEffect near the end of your useChatPageLogic hook, before the return statement

// Add this useEffect in your ChatPage component, after the existing useEffects
// Corrected useEffects - Place these near the end of your useChatPageLogic hook

// 1. Handle page refresh/close (KEEP generation stopping only on actual page unload)
useEffect(() => {
  const handlePageUnload = () => {
    // Only stop generation when page is actually being unloaded (refresh/close)
    if ((isWorkflowActive || isStreamingGeneration) && projectId) {
      const stopUrl = `${baseUrl}/api/generate/stop/${projectId}`;
      const stopData = JSON.stringify({ projectId });
      
      // Use sendBeacon for reliability during page unload
      navigator.sendBeacon(stopUrl, new Blob([stopData], {
        type: 'application/json'
      }));
      
      console.log('🛑 Generation stopped due to page unload');
    }
  };

  // More precise detection for actual refresh vs tab switch
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // This only triggers on actual page navigation/refresh/close
    handlePageUnload();
  };

  const handlePageHide = (event: PageTransitionEvent) => {
    // Only stop if the page is NOT being persisted in cache
    // This means it's actually being closed/navigated away from
    if (!event.persisted && (isWorkflowActive || isStreamingGeneration) && projectId) {
      handlePageUnload();
    }
  };

  // Listen for keyboard refresh shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    const isRefreshShortcut = (
      event.key === 'F5' ||                    // F5
      (event.ctrlKey && event.key === 'r') ||  // Ctrl+R
      (event.ctrlKey && event.key === 'F5') || // Ctrl+F5
      (event.metaKey && event.key === 'r')     // Cmd+R (Mac)
    );

    if (isRefreshShortcut && (isWorkflowActive || isStreamingGeneration) && projectId) {
      handlePageUnload();
    }
  };

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('keydown', handleKeyDown);

  // Cleanup
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('pagehide', handlePageHide);
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isWorkflowActive, isStreamingGeneration, projectId, baseUrl]);

// 2. Handle visibility changes (DON'T stop generation on tab switch)
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('📋 Tab switched away - keeping generation running in background');
      // DO NOT stop generation - just log for debugging
    } else {
      console.log('👁️ Tab back in focus - generation continues');
      // Optionally refresh UI state or check progress when user returns
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []); // No dependencies needed since we're not stopping generation

// 3. Optional: Handle focus/blur for additional awareness (without stopping)
useEffect(() => {
  const handleWindowFocus = () => {
    console.log('🎯 Window focused - checking generation status');
    // Optionally ping server to check if generation is still running
    // or refresh the UI state when user returns
  };

  const handleWindowBlur = () => {
    console.log('😴 Window blurred - generation continues in background');
    // Just log, don't stop anything
  };

  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('blur', handleWindowBlur);

  return () => {
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('blur', handleWindowBlur);
  };
}, []);

// 4. Component unmount cleanup (only stop if component is being destroyed)
useEffect(() => {
  return () => {
    // Only stop generation if the entire component is being unmounted
    // This happens when navigating to a completely different page
    console.log('🔄 Component unmounting - deciding whether to stop generation');
    
    // You can add logic here to determine if you should stop
    // For example, only stop if navigating away from the app entirely
    const shouldStopOnUnmount = false; // Set this based on your needs
    
    if (shouldStopOnUnmount && (isWorkflowActive || isStreamingGeneration) && projectId) {
      fetch(`${baseUrl}/api/generate/stop/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      }).catch(err => console.warn('Failed to stop on unmount:', err));
    }
    
    // Clear processing queues
    chunkProcessingQueue.current = [];
    isProcessingQueue.current = false;
  };
}, []); // Empty dependency array - only runs on actual unmount

// Place these useEffect hooks right before your return statement in useChatPageLogic
  const handleSubmit = useCallback(async () => {
  if (!prompt.trim() || isLoading || isStreamingGeneration || isWorkflowActive) return;
  
  console.log("🔍 DEBUG handleSubmit - canModify:", canModify); // ADD THIS DEBUG LINE
  
  if (canModify && !isWorkflowActive && !isStreamingGeneration) {
    console.log("✅ Using MODIFICATION path");
    
    // ADD USER MESSAGE IMMEDIATELY (before the API call)
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      type: "user", 
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentPrompt = prompt;
    setPrompt("");
    
    await sendModificationRequest(currentPrompt);
    return;
  }

  console.log("⚠️ Using WORKFLOW path"); // ADD THIS DEBUG LINE
  console.log("📝 User submitted prompt:", prompt);
  setIsLoading(true);
  setError("");

  const newMessage: Message = {
    id: Date.now().toString(),
    content: prompt,
    type: "user",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, newMessage]);
  const currentPrompt = prompt;
  setPrompt("");

  try {
    if (projectId) {
      await startCompleteWorkflow(currentPrompt, projectId);
    } else {
      throw new Error("No project ID available for workflow");
    }
  } catch (error) {
    console.error("❌ Error in handleSubmit:", error);
    setError("Failed to process request");

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Sorry, I encountered an error while processing your request.",
      type: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}, [  prompt, 
  isLoading, 
  isModifying,           // NEW
  canModify,             // NEW
  isWorkflowActive, 
  isStreamingGeneration, 
  projectId, 
  startCompleteWorkflow, 
  sendModificationRequest, // NEW
  setIsLoading, 
  setError, 
  setMessages, 
  setPrompt]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const retryConnection = useCallback(async () => {
    setIsRetrying(true);
    setError("");
    setProjectStatus("loading");

    healthCheckDone.current = false;
    projectLoaded.current = false;
    hasInitialized.current = false;

    try {
      const isHealthy = await checkServerHealth();
      if (isHealthy) {
        if (existingProject && projectId) {
          await loadProject(projectId);
          await loadProjectMessages(projectId);
        } else if (fromWorkflow && navPrompt && projectId) {
          setPrompt(navPrompt);
          await startCompleteWorkflow(navPrompt, projectId);
        } else {
          setProjectStatus("idle");
        }
        hasInitialized.current = true;
      }
    } catch (error) {
      setError("Still cannot connect to server. Please check your backend setup.");
      setProjectStatus("error");
    } finally {
      setIsRetrying(false);
    }
  }, [checkServerHealth, existingProject, projectId, fromWorkflow, navPrompt, loadProject,
      loadProjectMessages, startCompleteWorkflow, setIsRetrying, setError, setProjectStatus, setPrompt]);

  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  }, []);

  const formatSpeed = useCallback((bytesPerSecond: number) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`;
  }, []);

  // Initialize on mount with proper error handling
 // Fix for useChatPageLogic - Replace the initialization useEffect with this enhanced version

// Initialize on mount with proper error handling and auto-start
useEffect(() => {
  if (hasInitialized.current) {
    return;
  }

  hasInitialized.current = true;

  const initialize = async () => {
    console.log("🚀 ChatPage initialization started");
    console.log("🔍 Navigation state:", { fromWorkflow, navPrompt, projectId, existingProject });
    
    if (fromWorkflow || navPrompt) {
      setIsNavigating(true);
    }

    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      setProjectStatus("error");
      setIsNavigating(false);
      return;
    }

    try {
      if (fromWorkflow && projectId) {
        console.log("🎨 AUTO-STARTING WORKFLOW FROM INDEX PAGE");
        
        // Load the project first
        await loadProject(projectId);
        
        // Add user message if we have navPrompt
        if (navPrompt) {
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: navPrompt,
            type: "user",
            timestamp: new Date(),
          };
          setMessages([userMessage]);
          
          // Small delay to let the UI update, then start workflow
          setTimeout(async () => {
            console.log("🚀 STARTING COMPLETE WORKFLOW AUTOMATICALLY");
            await startCompleteWorkflow(navPrompt, projectId);
          }, 500);
        } else {
          // If no prompt, create a generic one for workflow completion
          const genericPrompt = "Complete the application generation based on the design choices from the design process.";
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: "Completing application generation from design process...",
            type: "user",
            timestamp: new Date(),
          };
          setMessages([userMessage]);
          
          setTimeout(async () => {
            console.log("🚀 STARTING WORKFLOW WITH GENERIC PROMPT");
            await startCompleteWorkflow(genericPrompt, projectId);
          }, 500);
        }
      } else if (existingProject && projectId) {
        console.log("📂 EXISTING PROJECT: Loading project and messages");
        await loadProject(projectId);
        await loadProjectMessages(projectId);
      } else if (projectId) {
        console.log("🔍 PROJECT ID ONLY: Loading project details");
        await loadProject(projectId);
        await loadProjectMessages(projectId);
      } else {
        console.log("⭐ NO PROJECT: Ready for user input");
        setProjectStatus("idle");
      }
    } catch (error) {
      console.error("❌ Initialization error:", error);
      setError("Failed to initialize project");
      setProjectStatus("error");
    } finally {
      setIsNavigating(false);
    }

    console.log("✅ ChatPage initialization complete");
  };

  // Small delay to prevent blocking UI
  setTimeout(initialize, 100);
}, []); // Empty dependency array - only run once on mount

// ALSO ADD: Additional useEffect to monitor fromWorkflow state changes
useEffect(() => {
  // This effect handles cases where fromWorkflow state might change after initial mount
  if (!hasInitialized.current) return;
  
  if (fromWorkflow && projectId && !isWorkflowActive && !isStreamingGeneration) {
    console.log("🔄 fromWorkflow detected after initialization, checking if workflow should start");
    
    // Check if we haven't started a workflow yet
    if (workflowSteps.length === 0 && !isLoading) {
      console.log("🚀 Starting delayed workflow from fromWorkflow state");
      
      const genericPrompt = "Complete the application generation based on the design choices.";
      const userMessage: Message = {
        id: `user-delayed-${Date.now()}`,
        content: "Completing application generation from design process...",
        type: "user",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      setTimeout(async () => {
        await startCompleteWorkflow(genericPrompt, projectId);
      }, 1000);
    }
  }
}, [fromWorkflow, projectId, isWorkflowActive, isStreamingGeneration, workflowSteps.length, isLoading]);

// DEBUGGING: Add this useEffect to log state changes
useEffect(() => {
  console.log("🔍 ChatPage State Update:", {
    fromWorkflow,
    projectId,
    isWorkflowActive,
    isStreamingGeneration,
    workflowStepsCount: workflowSteps.length,
    hasInitialized: hasInitialized.current,
    projectStatus,
    currentProjectId: currentProjectId.current  // ✅ Fixed
  });
}, [fromWorkflow, projectId, isWorkflowActive, isStreamingGeneration, workflowSteps.length, projectStatus]); // Empty dependency array - only run once on mount

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending timeouts/intervals
      chunkProcessingQueue.current = [];
      isProcessingQueue.current = false;
    };
  }, []);

  return {
    // Refs
    messagesEndRef,
    
    // Location data
    projectId,
    existingProject,
    supabaseConfig,
    clerkId,
    passedUserId,
    fromWorkflow,
    navPrompt,
    baseUrl,
    
    // Enhanced functions
    scrollToBottom,
    getCurrentUserId,
    addWorkflowStep,
    updateWorkflowStep,
    resetStreamingState,
    handleStreamingData,
    checkServerHealth,
    loadProject,
    loadProjectMessages,
    startStreamingFrontendGeneration,
    startCompleteWorkflow,
    clearConversation,
    stopWorkflow,
    handlePromptChange,
    handleSubmit,
    handleKeyPress,
    retryConnection,
    formatDuration,
    formatSpeed,
    
    // New enhanced functions
    toggleCodeStreamVisibility,
    shouldShowCodeStreamAsMain,
     sendModificationRequest,
  };
};