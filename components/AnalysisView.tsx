
import React from 'react';
import { Analysis } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PencilIcon } from './icons/PencilIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface AnalysisViewProps {
  analysis: Analysis;
  onNewSession: () => void;
}

const AnalysisCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-cyan-300">{title}</h3>
    </div>
    <ul className="space-y-2 list-disc list-inside text-gray-300">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  </div>
);

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onNewSession }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 text-center border-b border-gray-700">
        <h2 className="text-3xl font-bold">대화 분석</h2>
        <p className="text-gray-400">오늘 세션에 대한 피드백입니다.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnalysisCard title="잘한 점" items={analysis.strengths} icon={<SparklesIcon className="w-6 h-6 text-green-400"/>} />
        <AnalysisCard title="개선할 점" items={analysis.weaknesses} icon={<LightbulbIcon className="w-6 h-6 text-yellow-400"/>} />
        <AnalysisCard title="숙제" items={analysis.homework} icon={<PencilIcon className="w-6 h-6 text-orange-400"/>} />
        
        <div className="bg-gray-800/70 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="w-6 h-6 text-blue-400"/>
            <h3 className="text-xl font-semibold text-cyan-300">대화 내용</h3>
          </div>
          <div className="max-h-48 overflow-y-auto bg-gray-900 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
            {analysis.transcript}
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-700 mt-auto">
        <button
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          새 세션 시작하기
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
