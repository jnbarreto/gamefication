import { useTranslation } from "react-i18next";

const LOGO_SRC = "/logo-icon.png";

type ProjectLogoProps = {
  size?: "sm" | "md";
  showText?: boolean;
};

export default function ProjectLogo({
  size = "md",
  showText = true,
}: ProjectLogoProps) {
  const { t } = useTranslation();
  const dimension = size === "sm" ? 36 : 52;

  return (
    <div className="flex items-center gap-3">
      <img
        src={LOGO_SRC}
        alt={t("layout.brand")}
        width={dimension}
        height={dimension}
        className={`shrink-0 rounded-panel ring-1 ring-accent/25 ${
          size === "sm" ? "h-9 w-9" : "h-[3.25rem] w-[3.25rem]"
        }`}
      />
      {showText && (
        <h1 className="ds-brand-title">{t("layout.title")}</h1>
      )}
    </div>
  );
}
