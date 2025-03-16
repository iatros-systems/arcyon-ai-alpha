
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled: boolean;
}

const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input);
      setInput("");
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

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass rounded-lg shadow-sm">
            <div className="flex">
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
                <Button type="button" size="icon" variant="ghost" disabled={disabled}>
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
                size="sm" 
                className={cn(
                  "px-3",
                  disabled || !input.trim() ? "opacity-50 cursor-not-allowed" : ""
                )}
                disabled={disabled || !input.trim()}
              >
                <Send className="h-4 w-4 mr-1" /> 
                Enviar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
