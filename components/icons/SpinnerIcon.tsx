
import React from 'react';

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M12 21v-.01M4.929 4.929l.01.01M19.071 19.071l-.01-.01M3 12h.01M21 12h-.01M4.929 19.071l.01-.01M19.071 4.929l-.01.01" />
    </svg>
);
