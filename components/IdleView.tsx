import React, { useState } from 'react';
import { BellIcon } from './icons/BellIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface IdleViewProps {
  topics: string[];
  selectedTopic: string | null;
  onTopicSelect: (topic: string) => void;
  onStartCall: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  notificationsSupported: boolean;
}

const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);


const IdleView: React.FC<IdleViewProps> = ({ 
    topics,
    selectedTopic,
    onTopicSelect, 
    onStartCall,
    notificationPermission,
    onRequestNotificationPermission,
    notificationsSupported
}) => {
    const [timeInput, setTimeInput] = useState('10:00');
    const [calendarLinkGenerated, setCalendarLinkGenerated] = useState(false);

    const handleAddToCalendar = () => {
        const [hours, minutes] = timeInput.split(':').map(Number);
        const now = new Date();
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (startTime < now) {
            startTime.setDate(startTime.getDate() + 1);
        }

        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 minute duration

        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

        const event = {
            title: "Gemini 영어 통화 연습",
            details: `매일 영어 회화 연습을 위한 시간입니다! 앱을 열고 오늘의 주제로 대화를 시작하세요.\n\n앱으로 돌아가기: ${window.location.href}`,
            start: formatDate(startTime),
            end: formatDate(endTime),
            recurrence: "RRULE:FREQ=DAILY",
        };

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.details)}&recur=${encodeURIComponent(event.recurrence)}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
        setCalendarLinkGenerated(true);
    };

    const renderNotificationSettings = () => {
        if (!notificationsSupported) {
            return (
                <p className="text-gray-500 text-sm">이 브라우저에서는 알림을 지원하지 않습니다.</p>
            );
        }

        switch (notificationPermission) {
            case 'granted':
                return (
                    <div className="w-full">
                        {calendarLinkGenerated ? (
                             <p className="text-green-400 mb-2 text-sm text-center">캘린더에 {timeInput} 연습 일정이 추가되었습니다!</p>
                        ) : (
                             <p className="text-gray-400 mb-2 text-sm">매일 연습할 시간을 선택하고 캘린더에 추가하세요.</p>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white w-full"
                                aria-label="알림 시간 설정"
                            />
                            <button onClick={handleAddToCalendar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5"/>
                                추가
                            </button>
                        </div>
                    </div>
                );
            case 'denied':
                return (
                    <p className="text-red-400 text-sm">알림이 차단되었습니다. 브라우저 설정에서 권한을 변경해주세요.</p>
                );
            case 'default':
            default:
                return (
                    <button
                        onClick={onRequestNotificationPermission}
                        className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                    >
                       <BellIcon className="w-6 h-6"/>
                        매일 알림 활성화하기
                    </button>
                );
        }
    }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 overflow-y-auto">
      <h1 className="text-4xl font-bold text-cyan-300 mb-2">Gemini 영어 통화</h1>
      <p className="text-gray-400 mb-8">매일 만나는 영어 연습 파트너.</p>
      
      <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 w-full max-w-md">
        <p className="text-gray-400 mb-3 text-sm">오늘의 대화 주제를 선택하세요</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {topics.map(topic => (
                <button
                    key={topic}
                    onClick={() => onTopicSelect(topic)}
                    className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${selectedTopic === topic ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                >
                    {topic}
                </button>
            ))}
        </div>
        <button
          onClick={onStartCall}
          disabled={!selectedTopic}
          className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-600/30 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
        >
          <PhoneIcon />
          통화 시작
        </button>
      </div>

      <div className="w-full max-w-md mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-300">일일 캘린더 알림</h3>
          {renderNotificationSettings()}
      </div>
    </div>
  );
};

export default IdleView;