type ThemeIconProps = {
  className?: string;
};

export function RadianceIcon({ className = "h-5 w-5" }: ThemeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3.5 13.4 8l4.6 1.2-4.6 1.2L12 14.5 10.6 10.4 6 9.2l4.6-1.2L12 3.5Z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M12 6.25c0 0-2.75 3.5-2.75 6.75a2.75 2.75 0 1 0 5.5 0C14.75 9.75 12 6.25 12 6.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 17.75 12 21l2.5-3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 17.75h7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 2.5v1.25M12 20.25V21.5M4.25 12H3M21 12h-1.25M6.1 6.1l-.9-.9M18.8 18.8l-.9-.9M17.9 6.1l.9-.9M6.1 17.9l-.9.9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function VoidIcon({ className = "h-5 w-5" }: ThemeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3.75c4.56 0 8.25 3.69 8.25 8.25 0 1.55-.43 3-1.18 4.24C17.8 12.9 15.1 10.75 12 10.75S6.2 12.9 4.93 16.24A8.2 8.2 0 0 1 3.75 12c0-4.56 3.69-8.25 8.25-8.25Z"
        fill="currentColor"
        opacity="0.82"
      />
      <path
        d="M8.5 15.75c1.35-1.65 2.35-2.5 3.5-2.5s2.15.85 3.5 2.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="14.75" cy="9.75" r="0.85" fill="currentColor" opacity="0.45" />
      <path
        d="M16.5 7.5 18 6M6 18l1.5-1.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
