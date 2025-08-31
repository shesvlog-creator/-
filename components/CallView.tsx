
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { GoogleGenAI, Chat } from "@google/genai";
import { PhoneHangupIcon } from './icons/PhoneHangupIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface CallViewProps {
  topic: string;
  onEndCall: (conversation: ChatMessage[]) => void;
}

const CallView: React.FC<CallViewProps> = ({ topic, onEndCall }) => {
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isModelTyping, setIsModelTyping] = useState<boolean>(false);
  const { isListening, transcript, startListening, stopListening, error: speechError, isSupported } = useSpeechRecognition();
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a friendly and patient English conversation partner named Gemini. Your goal is to help the user practice speaking English about the topic: "${topic}". Keep your responses natural, encouraging, and not too long. Ask follow-up questions to keep the conversation flowing. Do not correct the user's grammar during the conversation, but make mental notes for later feedback. Start the conversation now by greeting the user and introducing the topic.`
        }
    });

    const startConversation = async () => {
        setIsModelTyping(true);
        if (!chatRef.current) return;
        try {
            const response = await chatRef.current.sendMessage({ message: "Start the conversation." });
            // Fix: Explicitly type modelResponse to match the ChatMessage interface.
            const modelResponse: ChatMessage = { role: 'model', text: response.text };
            setConversation([modelResponse]);
            speak(response.text);
        } catch(e) {
            console.error(e);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I had trouble starting. Could you try ending the call and starting again?' };
            setConversation([errorMessage]);
        } finally {
            setIsModelTyping(false);
        }
    };
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  // Handle transcript submission
  useEffect(() => {
    if (transcript) {
      handleSend(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !chatRef.current) return;
    
    const userMessage: ChatMessage = { role: 'user', text };
    setConversation(prev => [...prev, userMessage]);
    setIsModelTyping(true);

    try {
        const response = await chatRef.current.sendMessage({ message: text });
        // Fix: Explicitly type modelResponse to match the ChatMessage interface.
        const modelResponse: ChatMessage = { role: 'model', text: response.text };
        setConversation(prev => [...prev, modelResponse]);
        speak(response.text);
    } catch (e) {
        console.error(e);
        const errorMessage: ChatMessage = { role: 'model', text: 'I seem to be having trouble connecting. Please check your connection or API key.' };
        setConversation(prev => [...prev, errorMessage]);
    } finally {
        setIsModelTyping(false);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="flex flex-col h-full p-4">
        <div className="text-center p-2 border-b border-gray-700">
            <p className="text-sm text-gray-400">오늘의 대화 주제</p>
            <h2 className="text-xl font-semibold text-cyan-300">{topic}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-600 rounded-bl-none'}`}>
                        <p>{msg.text}</p>
                    </div>
                </div>
            ))}
            {isModelTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-600 rounded-2xl rounded-bl-none px-4 py-3">
                       <SpinnerIcon className="w-5 h-5" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {speechError && <div className="text-center text-red-400 p-2 text-sm">{speechError}</div>}
        {!isSupported && <div className="text-center text-yellow-400 p-2 text-sm">음성 인식이 브라우저에서 지원되지 않습니다.</div>}

        <div className="p-4 border-t border-gray-700 flex items-center justify-center gap-6">
            <button 
                onClick={() => onEndCall(conversation)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-transform transform hover:scale-110 shadow-lg shadow-red-500/30"
                aria-label="통화 종료"
            >
                <PhoneHangupIcon className="w-8 h-8"/>
            </button>
            <button 
                onClick={toggleListening}
                disabled={!isSupported}
                className={`text-white rounded-full p-6 transition-transform transform hover:scale-110 shadow-lg ${isListening ? 'bg-cyan-500 shadow-cyan-500/40 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}
                aria-label={isListening ? '듣기 중지' : '듣기 시작'}
            >
                <MicrophoneIcon className="w-10 h-10"/>
            </button>
            <div className="w-20"></div>
        </div>
    </div>
  );
};

export default CallView;
