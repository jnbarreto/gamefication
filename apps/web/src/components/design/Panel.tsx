import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <section className={`ds-panel ${className}`}>
      <h2 className="ds-panel__title">{title}</h2>
      <div className="ds-panel__body">{children}</div>
    </section>
  );
}
