// Fix: Corrected the React import to use curly braces for hooks.
import React, { useState, useEffect, useCallback } from 'react';
import { CallState, ChatMessage, Analysis } from './types';
import { getDailyTopics, getConversationAnalysis } from './services/geminiService';
import IdleView from './components/IdleView';
import CallView from './components/CallView';
import AnalysisView from './components/AnalysisView';
import { GoogleGenAI } from '@google/genai';
import useNotifications from './hooks/useNotifications';

const App: React.FC = () => {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [dailyTopics, setDailyTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { 
    permission: notificationPermission, 
    requestPermission: onRequestNotificationPermission, 
    isSupported: notificationsSupported 
  } = useNotifications();


  const startNewSession = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    setCallState(CallState.IDLE);
    setConversation([]);
    setAnalysis(null);
    setSelectedTopic(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY 환경 변수가 설정되지 않았습니다.");
      }
      // This is just a check for API key existence, not creating the instance for use here.
      new GoogleGenAI({ apiKey: process.env.API_KEY });
      const topics = await getDailyTopics();
      setDailyTopics(topics);
    } catch (err) {
      if (err instanceof Error) {
        setError(`초기화 실패: ${err.message}`);
        console.error(err);
      } else {
        setError('초기화 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  const handleStartCall = () => {
    if (selectedTopic) {
        setCallState(CallState.IN_PROGRESS);
    }
  };

  const handleEndCall = async (finalConversation: ChatMessage[]) => {
    setCallState(CallState.ANALYZING);
    try {
      const analysisResult = await getConversationAnalysis(finalConversation);
      setAnalysis(analysisResult);
      setCallState(CallState.FINISHED);
    } catch (err) {
       if (err instanceof Error) {
        setError(`분석 실패: ${err.message}`);
      } else {
        setError('분석 중 알 수 없는 오류가 발생했습니다.');
      }
      setCallState(CallState.IDLE); // Revert to idle on error
    }
  };

  const renderContent = () => {
    if (isInitializing) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-xl">수업을 초기화하는 중...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-300 bg-gray-800 p-4 rounded-lg">{error}</p>
          <p className="mt-4 text-gray-400">Gemini API 키가 환경 변수(API_KEY)로 올바르게 설정되었는지 확인하고 페이지를 새로고침하세요.</p>
        </div>
      );
    }
    
    switch (callState) {
      case CallState.IN_PROGRESS:
        return (
          <CallView
            topic={selectedTopic!}
            onEndCall={handleEndCall}
          />
        );
      case CallState.ANALYZING:
         return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl animate-pulse">대화를 분석하는 중...</p>
          </div>
        );
      case CallState.FINISHED:
        return analysis ? <AnalysisView analysis={analysis} onNewSession={startNewSession} /> : null;
      case CallState.IDLE:
      default:
        return (
          <IdleView 
            topics={dailyTopics} 
            selectedTopic={selectedTopic}
            onTopicSelect={setSelectedTopic}
            onStartCall={handleStartCall}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={onRequestNotificationPermission}
            notificationsSupported={notificationsSupported}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900/50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl h-[90vh] max-h-[800px] bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;