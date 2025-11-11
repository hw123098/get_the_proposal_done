import React from 'react';

export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
      <circle cx="12" cy="5" r="3" />
      <circle cx="12" cy="19" r="3" />
      <circle cx="5" cy="12" r="3" />
      <path d="M12 8v8" />
      <path d="M14.5 17.5 8 14" />
      <path d="m8.5 10.5 5.24 3.02" />
    </svg>
);
