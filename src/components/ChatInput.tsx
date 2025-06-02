import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, MicOff, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
//import { ElevenLabsWidget } from '@/components/ElevenLabsWidget'; // Assuming this path
import { loadElevenlabsWidget, removeElevenlabsWidget } from "@/services/elevenlabs";
import PersonalidadesDropdown from "@/components/ui/PersonalidadesDropdown";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled: boolean;
}

const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("Arcyon Alpha");
  const [isElevenLabsActive, setIsElevenLabsActive] = useState(false);
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

  const handleMicClick = () => {
    setIsElevenLabsActive((prev) => !prev);
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

  const [isElevenlabsWidgetActive, setIsElevenlabsWidgetActive] = useState(false);

  const handleToggleElevenlabsWidget = () => {
    if (!isElevenlabsWidgetActive) {
      loadElevenlabsWidget();
    } else {
      removeElevenlabsWidget();
    }
    setIsElevenlabsWidgetActive(!isElevenlabsWidgetActive);
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

              <div className="items-end bg-[#f8f9fb] rounded-xl px-4 py-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Envie uma mensagem..."
                  className="w-full min-h-[48px] max-h-[200px] border-0 border-transparent bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:border-transparent resize-none py-3 px-2"
                />

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={handleFileClick}>
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={handleToggleElevenlabsWidget}
                    variant={isElevenlabsWidgetActive ? "default" : "outline"}
                    className="flex gap-2"
                  >
                    {isElevenlabsWidgetActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1 flex justify-center">
                    <PersonalidadesDropdown />
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      "rounded-full w-10 h-10 flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white",
                      !input.trim() && selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                    )}
                    disabled={!input.trim() && selectedFiles.length === 0}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 mb-7">
              <div className="flex gap-1"></div>
            </div>
          </div>
        </form>
        {isElevenLabsActive && (
          <div className="absolute bottom-full left-0 right-0 mb-2">
            <ElevenLabsWidget /> {/* Adjust props as needed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
