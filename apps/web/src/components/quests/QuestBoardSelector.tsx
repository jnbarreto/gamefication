import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useConfirm } from "@/lib/confirm/ConfirmDialogProvider";
import type { QuestBoard } from "@/lib/quests/questBoardSelection";

type QuestBoardSelectorProps = {
  boards: QuestBoard[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onRenameBoard: (boardId: string, name: string) => void;
  onDeleteBoard: (boardId: string) => void;
};

type ModalMode = "create" | "rename" | null;

export default function QuestBoardSelector({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
}: QuestBoardSelectorProps) {
  const { t } = useTranslation();
  const { confirm } = useConfirm();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [boardNameInput, setBoardNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? boards[0];

  useEffect(() => {
    if (modalMode) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [modalMode]);

  function handleOpenCreate() {
    setBoardNameInput("");
    setModalMode("create");
  }

  function handleOpenRename() {
    if (!activeBoard) return;
    setBoardNameInput(activeBoard.name);
    setModalMode("rename");
  }

  async function handleDelete(board: QuestBoard) {
    if (boards.length <= 1) return;

    const confirmed = await confirm({
      title: t("questBoard.deleteBoard"),
      message: t("questBoard.deleteBoardConfirm", { name: board.name }),
      confirmLabel: t("common.delete", { defaultValue: "Excluir" }),
      cancelLabel: t("common.cancel", { defaultValue: "Cancelar" }),
      variant: "danger",
    });

    if (confirmed) {
      onDeleteBoard(board.id);
    }
  }

  function handleSubmitModal(event: FormEvent) {
    event.preventDefault();
    const trimmed = boardNameInput.trim();
    if (!trimmed) return;

    if (modalMode === "create") {
      onCreateBoard(trimmed);
    } else if (modalMode === "rename" && activeBoard) {
      onRenameBoard(activeBoard.id, trimmed);
    }

    setModalMode(null);
    setBoardNameInput("");
  }

  return (
    <>
      <div
        className="ds-quest-board__boards-bar"
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="ds-quest-board__boards-list">
          {boards.map((board) => {
            const isActive = board.id === activeBoardId;

            return (
              <div
                key={board.id}
                className={`ds-quest-board__board-tab ${isActive ? "ds-quest-board__board-tab--active" : ""}`}
              >
                <button
                  type="button"
                  className="ds-quest-board__board-tab-btn ds-focus"
                  onClick={() => onSelectBoard(board.id)}
                  aria-selected={isActive}
                >
                  <span className="truncate max-w-[12rem]">{board.name}</span>
                  <span className="ds-quest-board__board-count font-mono">
                    {board.questIds.length}
                  </span>
                </button>

                {isActive && (
                  <div className="flex items-center gap-0.5 pr-1">
                    <button
                      type="button"
                      className="ds-quest-board__board-action-btn ds-focus"
                      title={t("questBoard.renameBoard")}
                      aria-label={t("questBoard.renameBoard")}
                      onClick={handleOpenRename}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.197 10.328a1.75 1.75 0 0 0-.465.753l-.68 2.38a.75.75 0 0 0 .922.922l2.38-.68a1.75 1.75 0 0 0 .753-.465l7.816-7.816a1.75 1.75 0 0 0 0-2.475l-.435-.434ZM11.72 3.22a.25.25 0 0 1 .354 0l.435.435a.25.25 0 0 1 0 .354l-.884.884-1.224-1.224.884-.884l.435.435Zm-1.59 1.59 1.224 1.224-6.398 6.398a.25.25 0 0 1-.108.066l-1.614.461.461-1.614a.25.25 0 0 1 .066-.108l6.369-6.427Z" />
                      </svg>
                    </button>

                    {boards.length > 1 && (
                      <button
                        type="button"
                        className="ds-quest-board__board-action-btn ds-quest-board__board-action-btn--danger ds-focus"
                        title={t("questBoard.deleteBoard")}
                        aria-label={t("questBoard.deleteBoard")}
                        onClick={() => handleDelete(board)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.074l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.074l.275-5.5a.75.75 0 0 1 .786-.713Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="ds-quest-board__new-board-btn ds-focus"
            onClick={handleOpenCreate}
            title={t("questBoard.newBoard")}
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>{t("questBoard.newBoard")}</span>
          </button>
        </div>
      </div>

      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="board-modal-title"
          onClick={() => setModalMode(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setModalMode(null);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-panel border border-border/30 bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="board-modal-title" className="text-base font-semibold text-foreground">
              {modalMode === "create"
                ? t("questBoard.newBoard")
                : t("questBoard.renameBoard")}
            </h3>

            <form onSubmit={handleSubmitModal} className="mt-4">
              <label className="block text-small text-foreground-muted mb-1.5">
                {t("questBoard.boardName")}
              </label>
              <input
                ref={inputRef}
                type="text"
                required
                maxLength={40}
                placeholder={t("questBoard.boardNamePlaceholder")}
                value={boardNameInput}
                onChange={(e) => setBoardNameInput(e.target.value)}
                className="w-full rounded-panel border border-border/30 bg-base px-3 py-2 text-small text-foreground placeholder:text-foreground-muted/50 ds-focus"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-panel border border-border/25 px-3 py-1.5 text-small text-foreground-muted hover:text-foreground ds-focus"
                  onClick={() => setModalMode(null)}
                >
                  {t("common.cancel", { defaultValue: "Cancelar" })}
                </button>
                <button
                  type="submit"
                  disabled={!boardNameInput.trim()}
                  className="ds-btn-primary px-4 py-1.5 text-small disabled:opacity-50"
                >
                  {modalMode === "create"
                    ? t("questBoard.createBoard")
                    : t("common.save", { defaultValue: "Salvar" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
