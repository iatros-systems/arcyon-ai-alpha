
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, MicOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled: boolean;
}

const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedFiles.length > 0) && !disabled) {
      onSubmit(input, selectedFiles.length > 0 ? selectedFiles : undefined);
      setInput("");
      setSelectedFiles([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle speech recognition
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-background p-4 shadow-sm">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass rounded-lg shadow-sm">
            <div className="flex flex-col">
              {selectedFiles.length > 0 && (
                <div className="px-4 pt-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Envie uma mensagem..."
                className="min-h-[60px] max-h-[200px] border-0 bg-transparent focus-visible:ring-0 resize-none py-4 px-4"
                disabled={disabled}
              />
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  multiple
                  onChange={handleFileChange}
                  disabled={disabled}
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleFileClick}
                  disabled={disabled}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  size="icon" 
                  variant={isRecording ? "destructive" : "ghost"}
                  onClick={toggleRecording}
                  disabled={disabled}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className={cn(
                  disabled || (!input.trim() && selectedFiles.length === 0) ? "opacity-50 cursor-not-allowed" : ""
                )}
                disabled={disabled || (!input.trim() && selectedFiles.length === 0)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
