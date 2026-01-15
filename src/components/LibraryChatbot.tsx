import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Loader2, Camera, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // Base64 image for display
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/library-chat`;

// Props for the LibraryChatbot component
export interface LibraryChatbotProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const LibraryChatbot = ({ forceOpen = false, onClose }: LibraryChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! 👋 I'm your MMES College Library assistant. Ask me about books, timings, borrowing rules, or any library services! You can also use the camera 📷 to scan book covers for information." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const streamChatRef = useRef<((msg: string, image?: string) => void) | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle forceOpen prop - open chatbot when "Ask a Librarian" is clicked
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Handle close - notify parent when closed
  const handleClose = () => {
    setIsOpen(false);
    stopCamera();
    onClose?.();
  };

  // Cleanup speech recognition and camera on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopCamera();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Start camera
  const startCamera = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsCameraActive(true);
      setCapturedImage(null);
      
      toast({
        title: "📷 Camera Ready",
        description: "Point at a book cover and tap capture.",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan book covers.",
        variant: "destructive",
      });
      setShowCameraModal(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Open camera modal
  const openCamera = () => {
    setShowCameraModal(true);
    setCapturedImage(null);
    setTimeout(() => startCamera(), 100);
  };

  // Close camera modal
  const closeCameraModal = () => {
    stopCamera();
    setShowCameraModal(false);
    setCapturedImage(null);
  };

  // Capture image from video
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        
        toast({
          title: "✅ Image Captured",
          description: "Send to search for this book, or retake.",
        });
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        setShowCameraModal(true);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send captured image
  const sendCapturedImage = () => {
    if (capturedImage) {
      streamChatRef.current?.("What book is this? Please help me find information about it in the library.", capturedImage);
      closeCameraModal();
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleListening = async () => {
    // Check for browser support
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser. Try Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    // Request microphone permission explicitly for mobile devices
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release immediately after permission check
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
      return;
    }

    // Initialize recognition if not already done
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice recognized:', transcript);
        setIsListening(false);
        
        if (transcript.trim()) {
          setInput(transcript);
          setTimeout(() => {
            streamChatRef.current?.(transcript.trim());
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let message = "Could not recognize speech. Please try again.";
        if (event.error === 'not-allowed') {
          message = "Microphone access denied. Please enable it in your browser settings.";
        } else if (event.error === 'no-speech') {
          message = "No speech detected. Please try speaking again.";
        }
        
        toast({
          title: "Voice Error",
          description: message,
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "🎤 Listening",
          description: "Speak now... I'm ready to hear your question.",
        });
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const streamChatInternal = useCallback(async (userMessage: string, imageBase64?: string) => {
    const userMsg: Message = { 
      role: "user", 
      content: userMessage,
      image: imageBase64 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Please log in",
          description: "You must be logged in to use the chat assistant.",
          variant: "destructive",
        });
        setIsLoading(false);
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
        return;
      }

      // Prepare message content - with or without image
      const messageContent = imageBase64 
        ? [
            { type: "text", text: userMessage },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        : userMessage;

      const messagesToSend = messages.map(m => ({
        role: m.role,
        content: m.image 
          ? [
              { type: "text", text: m.content },
              { type: "image_url", image_url: { url: m.image } }
            ]
          : m.content
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: [...messagesToSend, { role: "user", content: messageContent }] 
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({ error: "Failed to get response" }));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      // Add empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === "assistant") {
                  newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Speak the response
      if (assistantContent) {
        speakText(assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  // Keep streamChatRef updated with latest function
  useEffect(() => {
    streamChatRef.current = streamChatInternal;
  }, [streamChatInternal]);

  const streamChat = useCallback((userMessage: string, image?: string) => {
    streamChatInternal(userMessage, image);
  }, [streamChatInternal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      streamChat(input.trim());
    }
  };

  const suggestedQuestions = [
    "What are the library timings?",
    "How many books can I borrow?",
    "Do you have programming books?",
    "What's the late fee?",
  ];

  return (
    <>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-gradient-primary hover:shadow-glow transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <Card className="w-[380px] h-[520px] flex flex-col shadow-2xl border-2 border-primary/20">
          <CardHeader className="bg-gradient-primary text-white rounded-t-lg py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-lg">Library Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Volume2 className="h-4 w-4 animate-pulse" />
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded" 
                          className="rounded-lg mb-2 max-w-full h-auto max-h-32 object-cover"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => streamChat(q)}
                        disabled={isLoading}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                {/* Microphone Button */}
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className="shrink-0"
                  onClick={toggleListening}
                  disabled={isLoading}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                {/* Camera Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={openCamera}
                  disabled={isLoading}
                  title="Scan book cover"
                >
                  <Camera className="h-4 w-4" />
                </Button>

                {/* Gallery Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title="Upload image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask about library..."}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  disabled={isLoading || isListening}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 bg-gradient-primary"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isListening && (
                <p className="text-xs text-primary mt-2 text-center animate-pulse">
                  🎤 Speak now...
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan Book Cover
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={closeCameraModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {/* Video preview or captured image */}
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
                {capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Action buttons */}
              <div className="flex gap-3">
                {capturedImage ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={retakePhoto}
                    >
                      Retake
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-primary"
                      onClick={sendCapturedImage}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Search Book
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Gallery
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-primary"
                      onClick={captureImage}
                      disabled={!isCameraActive}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                📷 Point your camera at a book cover to search for it in the library
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
