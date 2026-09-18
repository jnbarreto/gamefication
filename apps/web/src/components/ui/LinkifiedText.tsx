export function LinkifiedText({ text }: { text: string }) {
  if (!text) return null;

  // Match http:// or https:// and any non-whitespace, non-bracket characters
  const URL_REGEX = /(https?:\/\/[^\s\]]+)/g;
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(URL_REGEX)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
