import { FormEvent, PointerEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  AppWindow,
  Check,
  Circle,
  Eye,
  FileText,
  Folder,
  LogOut,
  Monitor,
  Power,
  Search,
  Settings,
  Terminal,
  Wifi,
  X,
} from "lucide-react";
import {
  LESSON_PASSWORD,
  LESSON_USERNAME,
  CONSOLE_HOSTNAME,
  apps,
  getLessonById,
  getLessonProgress,
  homeEntries,
  initialState,
  lessons,
  simulatorReducer,
  type AppId,
  type ConsoleState,
  type Lesson,
  type SimWindow,
  type TerminalState,
} from "./simulator";

type PointerPoint = {
  x: number;
  y: number;
};

const iconMap = {
  xeyes: Eye,
  terminal: Terminal,
  files: Folder,
};

export function App() {
  const [state, dispatch] = useReducer(simulatorReducer, initialState);
  const [username, setUsername] = useState(LESSON_USERNAME);
  const [password, setPassword] = useState("");
  const [lessonPasswords, setLessonPasswords] = useState<Record<string, string>>({});
  const [pointer, setPointer] = useState<PointerPoint>({ x: 0, y: 0 });

  const progress = getLessonProgress(state);
  const selectedLesson = getLessonById(state.selectedLessonId);
  const isConsoleOnlyLesson = state.selectedLessonId === "console-from-gui";
  const currentTime = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    [],
  );

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "login.submit", username, password });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (state.screen === "login" && event.ctrlKey && event.altKey && event.key === "F3") {
        event.preventDefault();
        dispatch({ type: "console.switch" });
        return;
      }

      if (state.screen !== "consoleLogin") {
        const focusedWindow = state.windows.find((window) => window.id === state.focusedWindowId);
        if (focusedWindow?.appId !== "terminal") {
          return;
        }

        const key = event.key.toLowerCase();

        if (event.ctrlKey && !event.metaKey && !event.altKey) {
          if (key === "c") {
            event.preventDefault();
            dispatch({ type: "terminal.ctrlC" });
            return;
          }

          if (key === "z") {
            event.preventDefault();
            dispatch({ type: "terminal.ctrlZ" });
            return;
          }

          if (key === "d") {
            event.preventDefault();
            dispatch({ type: "terminal.ctrlD" });
            return;
          }

          if (key === "p") {
            event.preventDefault();
            dispatch({ type: "terminal.historyPrev" });
            return;
          }

          if (key === "l") {
            event.preventDefault();
            dispatch({ type: "terminal.clear" });
            return;
          }
        }

        if (event.key === "Enter") {
          event.preventDefault();
          dispatch({ type: "terminal.enter" });
          return;
        }

        if (event.key === "Backspace") {
          event.preventDefault();
          dispatch({ type: "terminal.backspace" });
          return;
        }

        if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
          event.preventDefault();
          dispatch({ type: "terminal.type", value: event.key });
        }
        return;
      }

      const isReturnShortcut =
        (event.altKey && event.key === "F12") ||
        (event.shiftKey && event.ctrlKey && event.altKey);

      if (isReturnShortcut) {
        event.preventDefault();
        dispatch({ type: "console.returnGui" });
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        dispatch({ type: "console.enter" });
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        dispatch({ type: "console.backspace" });
        return;
      }

      if (!event.ctrlKey && !event.metaKey && event.key.length === 1) {
        event.preventDefault();
        dispatch({ type: "console.type", value: event.key });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.screen, state.focusedWindowId, state.windows]);

  if (state.screen === "lessonSelect") {
    return (
      <>
        <LessonSelectScreen
          completedLessons={state.completedLessons}
          lessonPasswords={lessonPasswords}
          startError={state.lessonStartError}
          onLessonPasswordChange={(lessonId, value) => {
            setLessonPasswords((current) => ({ ...current, [lessonId]: value }));
            if (state.lessonStartError?.lessonId === lessonId) {
              dispatch({ type: "lesson.startError.reset" });
            }
          }}
          onStartLesson={(lessonId, accessPassword) =>
            dispatch({ type: "lesson.start", lessonId, accessPassword })
          }
        />
        <AppFooter />
      </>
    );
  }

  if (state.screen === "login") {
    return (
      <>
        <main
          className="gdm-screen"
          data-testid="gdm-login"
          onPointerMove={(event) => setPointer({ x: event.clientX, y: event.clientY })}
        >
          <div className="login-topbar">
            <span>{currentTime}</span>
            <div className="topbar-cluster" aria-label="システム状態">
              <Wifi size={17} />
              <Monitor size={17} />
              <Power size={17} />
            </div>
          </div>

          <section className="login-card" aria-label="GDMログイン">
            <div className="avatar" aria-hidden="true">
              <span>s</span>
            </div>
            <h1>student</h1>
            <p>AlmaLinux Workstation</p>
            <form onSubmit={submitLogin}>
              <label className="password-field">
                <span>ユーザー名</span>
                <input
                  aria-label="ユーザー名"
                  autoFocus
                  data-testid="username-input"
                  disabled={isConsoleOnlyLesson}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (state.loginError) {
                      dispatch({ type: "login.resetError" });
                    }
                  }}
                  placeholder={LESSON_USERNAME}
                  type="text"
                  value={username}
                />
              </label>
              <label className="password-field">
                <span>パスワード</span>
                <input
                  aria-label="パスワード"
                  data-testid="password-input"
                  disabled={isConsoleOnlyLesson}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (state.loginError) {
                      dispatch({ type: "login.resetError" });
                    }
                  }}
                  placeholder={LESSON_PASSWORD}
                  type="password"
                  value={password}
                />
              </label>
              {isConsoleOnlyLesson && (
                <div className="login-guidance">
                  この課題ではGUIログインは使用しません。Ctrl + Alt + F3でコンソールへ切り替えます。
                </div>
              )}
              {state.loginError && <div className="login-error">{state.loginError}</div>}
              <button
                className="primary-button"
                data-testid="signin-button"
                disabled={isConsoleOnlyLesson}
                type="submit"
              >
                サインイン
              </button>
            </form>
          </section>
          {selectedLesson && (
            <LessonPanel
              completedSteps={state.completedSteps}
              lesson={selectedLesson}
              progress={progress}
            />
          )}
          <XeyesPreview pointer={pointer} />
        </main>
        <AppFooter />
      </>
    );
  }

  if (state.screen === "consoleLogin") {
    return (
      <>
        <ConsoleLoginScreen consoleState={state.consoleState} />
        {selectedLesson && (
          <LessonPanel
            completedSteps={state.completedSteps}
            lesson={selectedLesson}
            progress={progress}
          />
        )}
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <main
        className="desktop"
        data-testid="desktop"
        onPointerMove={(event) => setPointer({ x: event.clientX, y: event.clientY })}
      >
        <TopBar
          clock={currentTime}
          isOverview={state.screen === "overview"}
          onLogout={() => dispatch({ type: "session.logout" })}
          onToggleOverview={() =>
            dispatch(state.screen === "overview" ? { type: "overview.close" } : { type: "overview.open" })
          }
        />

        {selectedLesson && (
          <LessonPanel
            completedSteps={state.completedSteps}
            lesson={selectedLesson}
            progress={progress}
          />
        )}

        <div className="wallpaper-mark">
          <span>AlmaLinux</span>
          <strong>GNOME</strong>
        </div>

        {state.screen === "overview" && (
          <Overview
            onClose={() => dispatch({ type: "overview.close" })}
            onLaunch={(appId) => dispatch({ type: "app.launch", appId })}
          />
        )}

        <div className="window-layer">
          {state.windows.map((window) => (
            <SimulatedWindow
              key={window.id}
              pointer={pointer}
              terminalState={state.terminalState}
              window={window}
              focused={state.focusedWindowId === window.id}
              onClose={() => dispatch({ type: "window.close", windowId: window.id })}
              onFocus={() => dispatch({ type: "window.focus", windowId: window.id })}
              onMove={(x, y) => dispatch({ type: "window.move", windowId: window.id, x, y })}
              onResize={(width, height) =>
                dispatch({ type: "window.resize", windowId: window.id, width, height })
              }
            />
          ))}
        </div>
      </main>
      <AppFooter />
    </>
  );
}

function AppFooter() {
  return <footer className="app-footer">builder: tksarah</footer>;
}

function LessonSelectScreen({
  completedLessons,
  lessonPasswords,
  startError,
  onLessonPasswordChange,
  onStartLesson,
}: {
  completedLessons: Record<string, boolean>;
  lessonPasswords: Record<string, string>;
  startError: { lessonId: string; message: string } | null;
  onLessonPasswordChange: (lessonId: string, value: string) => void;
  onStartLesson: (lessonId: string, accessPassword?: string) => void;
}) {
  return (
    <main className="lesson-select-screen" data-testid="lesson-select">
      <section className="lesson-select-shell" aria-label="課題選択">
        <header className="lesson-select-header">
          <span>Linux GUI Simulator</span>
          <h1>課題を選択</h1>
          <p>有効な課題を開始すると、AlmaLinux GNOME風の操作環境が起動します。</p>
        </header>

        <div className="lesson-list">
          {lessons.map((lesson) => (
            <article
              className={`lesson-card ${lesson.enabled ? "" : "disabled"}`}
              data-testid={`lesson-card-${lesson.id}`}
              key={lesson.id}
            >
              <div className="lesson-card-body">
                <div className="lesson-card-title">
                  <h2>{lesson.title}</h2>
                  {completedLessons[lesson.id] && <span className="lesson-status done">完了</span>}
                  {!lesson.enabled && <span className="lesson-status disabled">準備中</span>}
                  {lesson.enabled && lesson.accessPassword && (
                    <span className="lesson-status locked">講師パスワード</span>
                  )}
                </div>
                <p>{lesson.description}</p>
                <div className="lesson-meta">
                  <span>{lesson.steps.length} 手順</span>
                  <span>開始: {lesson.startScreen === "login" ? "GDMログイン" : "デスクトップ"}</span>
                </div>
              </div>
              <div className="lesson-card-actions">
                {lesson.enabled && lesson.accessPassword && (
                  <label className="lesson-password-field">
                    <span>開始パスワード</span>
                    <input
                      aria-label={`${lesson.title} の開始パスワード`}
                      data-testid={`lesson-password-${lesson.id}`}
                      onChange={(event) => onLessonPasswordChange(lesson.id, event.target.value)}
                      placeholder="講師パスワードを入力"
                      type="password"
                      value={lessonPasswords[lesson.id] ?? ""}
                    />
                  </label>
                )}
                {startError?.lessonId === lesson.id && (
                  <div className="lesson-start-error" data-testid={`lesson-start-error-${lesson.id}`}>
                    {startError.message}
                  </div>
                )}
                <button
                  className="primary-button lesson-start-button"
                  disabled={!lesson.enabled}
                  onClick={() => onStartLesson(lesson.id, lessonPasswords[lesson.id])}
                  type="button"
                >
                  開始
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ConsoleLoginScreen({ consoleState }: { consoleState: ConsoleState }) {
  const prompt =
    consoleState.mode === "login"
      ? `${CONSOLE_HOSTNAME} login: ${consoleState.loginName}`
      : consoleState.mode === "password"
        ? "Password:"
        : `[student@${CONSOLE_HOSTNAME} ~]$ ${consoleState.command}`;

  return (
    <main className="console-screen" data-testid="console-login" tabIndex={-1}>
      <div className="console-output" aria-label="仮想コンソール">
        {consoleState.lines.map((line, index) => (
          <div className="console-line" key={`${line}-${index}`}>
            {line || "\u00a0"}
          </div>
        ))}
        <div className="console-line active">
          {prompt}
          <span className="console-cursor" aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}

function TopBar({
  clock,
  isOverview,
  onLogout,
  onToggleOverview,
}: {
  clock: string;
  isOverview: boolean;
  onLogout: () => void;
  onToggleOverview: () => void;
}) {
  return (
    <header className="desktop-topbar">
      <button
        aria-pressed={isOverview}
        className="activities-button"
        onClick={onToggleOverview}
        type="button"
      >
        Activities
      </button>
      <div className="topbar-clock">{clock}</div>
      <div className="topbar-cluster" aria-label="システム状態">
        <Wifi size={16} />
        <Settings size={16} />
        <button className="topbar-icon-button" aria-label="ログアウト" onClick={onLogout} title="ログアウト" type="button">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

function LessonPanel({
  completedSteps,
  lesson,
  progress,
}: {
  completedSteps: Record<string, boolean>;
  lesson: Lesson;
  progress: { completed: number; total: number; percent: number };
}) {
  return (
    <aside className="lesson-panel" aria-label="課題進捗" data-testid="lesson-panel">
      <div className="lesson-panel-header">
        <span>{lesson.title}</span>
        <strong>
          {progress.completed} / {progress.total}
        </strong>
      </div>
      <div className="progress-track" aria-label={`進捗 ${progress.percent}%`}>
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <ol>
        {lesson.steps.map((step) => (
          <li className={completedSteps[step.id] ? "done" : ""} key={step.id}>
            {completedSteps[step.id] ? <Check size={15} /> : <Circle size={12} />}
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function Overview({
  onClose,
  onLaunch,
}: {
  onClose: () => void;
  onLaunch: (appId: AppId) => void;
}) {
  return (
    <section className="overview" data-testid="overview" onClick={onClose}>
      <div className="dash" onClick={(event) => event.stopPropagation()}>
        <button className="dash-icon active" title="アプリケーション" type="button">
          <AppWindow size={22} />
        </button>
        <button className="dash-icon" title="検索" type="button">
          <Search size={22} />
        </button>
      </div>
      <div className="overview-content" onClick={(event) => event.stopPropagation()}>
        <label className="search-box">
          <Search size={18} />
          <input aria-label="アプリを検索" placeholder="検索" />
        </label>
        <div className="app-grid" aria-label="アプリケーション">
          {apps.map((app) => {
            const Icon = iconMap[app.id as keyof typeof iconMap];
            return (
              <button
                aria-label={`${app.name} ${app.description} ${app.command}`}
                className="app-tile"
                disabled={"disabled" in app && app.disabled}
                key={app.id}
                onClick={() => !("disabled" in app && app.disabled) && onLaunch(app.id)}
                onDoubleClick={() => !("disabled" in app && app.disabled) && onLaunch(app.id)}
                type="button"
              >
                <span className="app-icon">
                  <Icon size={34} />
                </span>
                <strong>{app.name}</strong>
                <small>{app.command}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SimulatedWindow({
  focused,
  onClose,
  onFocus,
  onMove,
  onResize,
  pointer,
  terminalState,
  window: simWindow,
}: {
  focused: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  pointer: PointerPoint;
  terminalState: TerminalState;
  window: SimWindow;
}) {
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null);
  const minWidth = simWindow.appId === "terminal" ? 420 : 360;
  const minHeight = simWindow.appId === "terminal" ? 280 : 260;

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      dx: event.clientX - simWindow.x,
      dy: event.clientY - simWindow.y,
    };
    onFocus();
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return;
    }

    const nextX = Math.max(
      8,
      Math.min(globalThis.window.innerWidth - simWindow.width - 8, event.clientX - dragRef.current.dx),
    );
    const nextY = Math.max(
      34,
      Math.min(globalThis.window.innerHeight - simWindow.height - 8, event.clientY - dragRef.current.dy),
    );
    onMove(nextX, nextY);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      width: simWindow.width,
      height: simWindow.height,
      x: event.clientX,
      y: event.clientY,
    };
    onFocus();
  }

  function resize(event: PointerEvent<HTMLDivElement>) {
    if (!resizeRef.current) {
      return;
    }

    const maxWidth = globalThis.window.innerWidth - simWindow.x - 8;
    const maxHeight = globalThis.window.innerHeight - simWindow.y - 8;
    const nextWidth = Math.max(
      minWidth,
      Math.min(maxWidth, resizeRef.current.width + (event.clientX - resizeRef.current.x)),
    );
    const nextHeight = Math.max(
      minHeight,
      Math.min(maxHeight, resizeRef.current.height + (event.clientY - resizeRef.current.y)),
    );
    onResize(nextWidth, nextHeight);
  }

  function endResize(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    resizeRef.current = null;
  }

  return (
    <section
      className={`sim-window ${focused ? "focused" : ""}`}
      data-testid={`${simWindow.appId}-window`}
      onPointerDown={onFocus}
      style={{
        height: simWindow.height,
        left: simWindow.x,
        top: simWindow.y,
        width: simWindow.width,
        zIndex: simWindow.z,
      }}
    >
      <div
        className="window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
      >
        <span>{simWindow.title}</span>
        <button
          aria-label={`${simWindow.title}を閉じる`}
          className="window-close"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
      <div className="xeyes-stage">
        {simWindow.appId === "terminal" ? (
          <TerminalApp terminalState={terminalState} />
        ) : simWindow.appId === "xeyes" ? (
          <EyePair pointer={pointer} windowBox={simWindow} />
        ) : (
          <FilesApp />
        )}
      </div>
      <div
        aria-hidden="true"
        className="window-resize-handle"
        onPointerDown={startResize}
        onPointerMove={resize}
        onPointerUp={endResize}
      />
    </section>
  );
}

function TerminalApp({ terminalState }: { terminalState: TerminalState }) {
  const outputRef = useRef<HTMLDivElement | null>(null);
  const displayCwd =
    terminalState.cwd === "/home/student"
      ? "~"
      : terminalState.cwd.replace("/home/student/", "~/");
  const foregroundJob = terminalState.jobs.find((job) => job.id === terminalState.foregroundJobId) ?? null;
  const showPrompt = !(foregroundJob?.name === "demo-long" && foregroundJob.state === "Running");

  useEffect(() => {
    if (!outputRef.current) {
      return;
    }

    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [terminalState.command, terminalState.cwd, terminalState.lines]);

  return (
    <div className="terminal-app" data-testid="terminal-app">
      <div className="terminal-output" aria-label="Terminal" ref={outputRef}>
        {terminalState.lines.map((line, index) => (
          <div className="terminal-line" key={`${line}-${index}`}>
            {line || "\u00a0"}
          </div>
        ))}
        {showPrompt && (
          <div className="terminal-line active">
            [student@linux-server {displayCwd}]$ {terminalState.command}
            <span className="terminal-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

function FilesApp() {
  return (
    <div className="files-app" data-testid="files-app">
      <aside className="files-sidebar" aria-label="場所">
        <button className="selected" type="button">
          <Folder size={17} />
          Home
        </button>
        <button type="button">
          <Folder size={17} />
          Desktop
        </button>
        <button type="button">
          <Folder size={17} />
          Documents
        </button>
      </aside>
      <section className="files-content" aria-label="/home/student">
        <div className="files-path">
          <span>/</span>
          <span>home</span>
          <span>student</span>
        </div>
        <div className="file-grid">
          {homeEntries.map((entry) => (
            <button className="file-entry" key={entry.name} type="button">
              {entry.type === "folder" ? <Folder size={30} /> : <FileText size={30} />}
              <span>{entry.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function EyePair({ pointer, windowBox }: { pointer: PointerPoint; windowBox: SimWindow }) {
  const leftCenter = { x: windowBox.x + 118, y: windowBox.y + 125 };
  const rightCenter = { x: windowBox.x + 212, y: windowBox.y + 125 };

  return (
    <svg className="xeyes-svg" role="img" aria-label="マウスポインタを追うxeyes">
      <EyeShape center={leftCenter} localX={118} localY={100} pointer={pointer} />
      <EyeShape center={rightCenter} localX={212} localY={100} pointer={pointer} />
    </svg>
  );
}

function EyeShape({
  center,
  localX,
  localY,
  pointer,
}: {
  center: PointerPoint;
  localX: number;
  localY: number;
  pointer: PointerPoint;
}) {
  const dx = pointer.x - center.x;
  const dy = pointer.y - center.y;
  const angle = Math.atan2(dy, dx);
  const distance = Math.min(23, Math.hypot(dx, dy) / 11);
  const pupilX = localX + Math.cos(angle) * distance;
  const pupilY = localY + Math.sin(angle) * distance;

  return (
    <g>
      <ellipse cx={localX} cy={localY} fill="#f7f7f4" rx="45" ry="68" stroke="#171717" strokeWidth="5" />
      <circle cx={pupilX} cy={pupilY} fill="#101010" r="14" />
      <circle cx={pupilX - 4} cy={pupilY - 5} fill="#ffffff" opacity="0.85" r="3" />
    </g>
  );
}

function XeyesPreview({ pointer }: { pointer: PointerPoint }) {
  const previewBox = { x: window.innerWidth - 180, y: window.innerHeight - 150 };
  const leftCenter = { x: previewBox.x + 48, y: previewBox.y + 52 };
  const rightCenter = { x: previewBox.x + 110, y: previewBox.y + 52 };

  return (
    <svg className="login-xeyes" aria-hidden="true">
      <EyeShape center={leftCenter} localX={48} localY={52} pointer={pointer} />
      <EyeShape center={rightCenter} localX={110} localY={52} pointer={pointer} />
    </svg>
  );
}
