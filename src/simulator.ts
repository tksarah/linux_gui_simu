export type ScreenState = "lessonSelect" | "login" | "consoleLogin" | "desktop" | "overview";

export type AppId = "xeyes" | "files" | "terminal";

export type LessonStepId =
  | "login"
  | "overview"
  | "launchXeyes"
  | "stopXeyes"
  | "launchFiles"
  | "stopFiles"
  | "logout"
  | "switchConsole"
  | "consoleLogin"
  | "consoleLogout"
  | "returnGui"
  | "launchTerminal"
  | "runPwd"
  | "runCd"
  | "runEcho"
  | "runExport"
  | "runEchoEnv"
  | "runPrintf"
  | "runAlias"
  | "runAliasList"
  | "runHistory"
  | "runType"
  | "runJobs"
  | "runFg"
  | "runBg"
  | "runKill"
  | "runJobsAfterKill"
  | "runDemoStart"
  | "runCtrlC"
  | "runDemoSuspend"
  | "runJobsStopped"
  | "runCtrlP"
  | "runCtrlL"
  | "runCdDash"
  | "runBangBang"
  | "runBangPrefix"
  | "runBangNumber"
  | "runCaretSubstitute"
  | "runExitStatus"
  | "exitTerminal";

export type ConsoleMode = "login" | "password" | "shell";

export type ConsoleState = {
  mode: ConsoleMode;
  loginName: string;
  password: string;
  command: string;
  lines: string[];
};

export type TerminalState = {
  cwd: string;
  previousCwd: string | null;
  command: string;
  lines: string[];
  env: Record<string, string>;
  aliases: Record<string, string>;
  history: string[];
  historyIndex: number | null;
  lastExitStatus: number;
  jobs: Array<{
    id: number;
    name: string;
    state: "Stopped" | "Running" | "Terminated";
    background: boolean;
  }>;
  foregroundJobId: number | null;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  accessPassword?: string;
  startScreen: Extract<ScreenState, "login" | "desktop">;
  steps: Array<{ id: LessonStepId; label: string }>;
};

export type LessonStartError = {
  lessonId: string;
  message: string;
};

export type SimWindow = {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  hasMoved: boolean;
};

export type SimulatorState = {
  screen: ScreenState;
  loginError: string | null;
  lessonStartError: LessonStartError | null;
  activeUser: string;
  windows: SimWindow[];
  focusedWindowId: string | null;
  selectedLessonId: string | null;
  completedLessons: Record<string, boolean>;
  completedSteps: Record<LessonStepId, boolean>;
  consoleState: ConsoleState;
  terminalState: TerminalState;
  nextZ: number;
};

export type SimulatorAction =
  | { type: "lesson.start"; lessonId: string; accessPassword?: string }
  | { type: "lesson.startError.reset" }
  | { type: "login.submit"; username: string; password: string }
  | { type: "login.resetError" }
  | { type: "overview.open" }
  | { type: "overview.close" }
  | { type: "console.switch" }
  | { type: "console.returnGui" }
  | { type: "console.type"; value: string }
  | { type: "console.backspace" }
  | { type: "console.enter" }
  | { type: "terminal.type"; value: string }
  | { type: "terminal.backspace" }
  | { type: "terminal.enter" }
  | { type: "terminal.ctrlC" }
  | { type: "terminal.ctrlZ" }
  | { type: "terminal.ctrlD" }
  | { type: "terminal.historyPrev" }
  | { type: "terminal.historyNext" }
  | { type: "terminal.clear" }
  | { type: "app.launch"; appId: AppId }
  | { type: "window.focus"; windowId: string }
  | { type: "window.close"; windowId: string }
  | { type: "window.move"; windowId: string; x: number; y: number }
  | { type: "window.resize"; windowId: string; width: number; height: number }
  | { type: "session.logout" };

export const LESSON_USERNAME = "student";
export const LESSON_PASSWORD = "student";
export const INSTRUCTOR_LESSON_PASSWORD = "eisaku";
export const CONSOLE_HOSTNAME = "linux-server";

export const basicGnomeGuiSteps: Lesson["steps"] = [
  { id: "login", label: "ユーザー名とパスワードでログインする" },
  { id: "overview", label: "Activitiesを開く" },
  { id: "launchXeyes", label: "xeyesを起動する" },
  { id: "stopXeyes", label: "xeyesを停止する" },
  { id: "launchFiles", label: "Filesで /home/student を開く" },
  { id: "stopFiles", label: "Filesを停止する" },
  { id: "logout", label: "GNOMEからログアウトする" },
];

export const consoleFromGuiSteps: Lesson["steps"] = [
  { id: "switchConsole", label: "Ctrl + Alt + F3でコンソールへ切り替える" },
  { id: "consoleLogin", label: "studentユーザーでコンソールにログインする" },
  { id: "consoleLogout", label: "exitまたはlogoutでコンソールからログアウトする" },
  { id: "returnGui", label: "Alt + F12またはShift + Ctrl + AltでGUIログイン画面へ戻る" },
];

export const builtinCommandPracticeSteps: Lesson["steps"] = [
  { id: "login", label: "GUI環境へログインする" },
  { id: "overview", label: "Activitiesを開く" },
  { id: "launchTerminal", label: "Terminalを起動する" },
  { id: "runPwd", label: "pwdで現在のディレクトリを確認する" },
  { id: "runCd", label: "cd /tmpでディレクトリを移動する" },
  { id: "runEcho", label: 'echo "Hello"で文字列を表示する' },
  { id: "exitTerminal", label: "exitでTerminalを終了する" },
  { id: "logout", label: "GNOMEからログアウトする" },
];

export const builtinCommandPracticeTwoSteps: Lesson["steps"] = [
  { id: "login", label: "GUI画面へログインする" },
  { id: "overview", label: "Activitiesを開く" },
  { id: "launchTerminal", label: "Terminalを起動する" },
  { id: "runExport", label: "export COURSE=linux を実行する" },
  { id: "runEchoEnv", label: "echo $COURSE で変数の値を確認する" },
  { id: "runPrintf", label: 'printf "Hello\\n" を実行する' },
  { id: "runAlias", label: "alias ll='ls -l' を実行する" },
  { id: "runAliasList", label: "alias で設定した別名を確認する" },
  { id: "runHistory", label: "history を実行する" },
  { id: "runType", label: "type cd を実行する" },
  { id: "runJobs", label: "jobs を実行する" },
  { id: "runFg", label: "fg %1 を実行する" },
  { id: "runBg", label: "bg %1 を実行する" },
  { id: "runKill", label: "kill %1 を実行する" },
  { id: "runJobsAfterKill", label: "kill の後に jobs で job が消えたことを確認する" },
  { id: "exitTerminal", label: "exit でTerminalを終了する" },
  { id: "logout", label: "GNOMEからログアウトする" },
];

export const shellShortcutPracticeSteps: Lesson["steps"] = [
  { id: "login", label: "GUI画面へログインする" },
  { id: "overview", label: "Activitiesを開く" },
  { id: "launchTerminal", label: "Terminalを起動する" },
  { id: "runDemoStart", label: "demo-long を実行して、動作中プロセスを開始する" },
  { id: "runCtrlC", label: "Ctrl + c で実行中プロセスを強制終了し、プロンプトに戻る" },
  { id: "runDemoSuspend", label: "もう一度 demo-long を実行する" },
  { id: "runJobsStopped", label: "Ctrl + z で停止し、jobs で Stopped を確認する" },
  { id: "runCtrlP", label: "echo history-check を実行したあと Ctrl + p で直前の履歴を呼び出す" },
  { id: "runCtrlL", label: "Ctrl + l でTerminal表示をクリアする" },
  { id: "exitTerminal", label: "Ctrl + d でTerminalを終了する" },
  { id: "logout", label: "GNOMEからログアウトする" },
];

export const shellShortcutPracticeTwoSteps: Lesson["steps"] = [
  { id: "login", label: "GUI画面へログインする" },
  { id: "overview", label: "Activitiesを開く" },
  { id: "launchTerminal", label: "Terminalを起動する" },
  { id: "runCdDash", label: "cd /tmp で移動したあと cd - で元のディレクトリへ戻り、表示と pwd で確認する" },
  { id: "runBangBang", label: "echo repeat-me を実行したあと !! で直前のコマンドを再実行し、同じ出力が増えることを確認する" },
  { id: "runBangPrefix", label: "echo sample-token を実行したあと !echo で一致するコマンドを再実行し、同じ出力が増えることを確認する" },
  { id: "runBangNumber", label: "history で番号を確認したあと !1 で 1 番のコマンドを再実行する" },
  { id: "runCaretSubstitute", label: "echo hoge を実行したあと ^hoge^fuga で置換して再実行し、fuga を表示する" },
  { id: "runExitStatus", label: "false を実行したあと echo $? で終了ステータス 1 を確認する" },
  { id: "exitTerminal", label: "exit でTerminalを終了する" },
  { id: "logout", label: "GNOMEからログアウトする" },
];

export const lessons: Lesson[] = [
  {
    id: "basic-gnome-gui",
    title: "課題1: GNOME GUIの基本操作",
    description: "GDMログイン、Activities、xeyes、Files、ログアウトまでを確認します。",
    enabled: true,
    startScreen: "login",
    steps: basicGnomeGuiSteps,
  },
  {
    id: "console-from-gui",
    title: "参考： GUI環境でのコンソールの呼び出し",
    description: "GDMログイン画面から仮想コンソールへ切り替え、コンソールログインとログアウトを確認します。",
    enabled: true,
    accessPassword: "pass123",
    startScreen: "login",
    steps: consoleFromGuiSteps,
  },
  {
    id: "builtin-command-practice-1",
    title: "課題2： 組み込みコマンド演習１",
    description: "Terminalを起動し、cd、echo、pwd、exitの基本的な組み込みコマンドを確認します。",
    enabled: true,
    accessPassword: "pass999",
    startScreen: "login",
    steps: builtinCommandPracticeSteps,
  },
  {
    id: "builtin-command-practice-2",
    title: "課題3： 組み込みコマンド演習２",
    description:
      "Terminalを起動し、export、printf、alias、history、type、jobs、fg、bg、kill を順番に練習します。",
    enabled: true,
    accessPassword: "pass010",
    startScreen: "login",
    steps: builtinCommandPracticeTwoSteps,
  },
  {
    id: "shell-shortcut-practice-1",
    title: "課題4： シェルの操作（知っておくと便利機能１）",
    description:
      "Terminalを起動し、Ctrl + c、Ctrl + z、Ctrl + d、Ctrl + p、Ctrl + l の基本操作を確認します。",
    enabled: true,
    accessPassword: "Pass100",
    startScreen: "login",
    steps: shellShortcutPracticeSteps,
  },
  {
    id: "shell-shortcut-practice-2",
    title: "課題5：シェルの操作（知っておくと便利機能２）",
    description:
      "Terminalを起動し、cd -、!!、!X、!n、^hoge^fuga、$? の使いどころを確認します。",
    enabled: true,
    accessPassword: "p@ss200",
    startScreen: "login",
    steps: shellShortcutPracticeTwoSteps,
  },
];

export const apps: Array<{
  id: AppId;
  name: string;
  description: string;
  command: string;
  disabled?: boolean;
}> = [
  {
    id: "xeyes",
    name: "Xeyes",
    description: "ポインタを追う小さなXアプリ",
    command: "xeyes",
  },
  {
    id: "files",
    name: "Files",
    description: "/home/student を表示するファイルマネージャー",
    command: "nautilus",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "bash組み込みコマンドを練習する端末",
    command: "gnome-terminal",
  },
];

export const homeEntries = [
  { name: "Desktop", type: "folder" },
  { name: "Documents", type: "folder" },
  { name: "Downloads", type: "folder" },
  { name: "Pictures", type: "folder" },
  { name: "README.txt", type: "file" },
];

export const emptyCompletedSteps: Record<LessonStepId, boolean> = {
  login: false,
  overview: false,
  launchXeyes: false,
  stopXeyes: false,
  launchFiles: false,
  stopFiles: false,
  logout: false,
  switchConsole: false,
  consoleLogin: false,
  consoleLogout: false,
  returnGui: false,
  launchTerminal: false,
  runPwd: false,
  runCd: false,
  runEcho: false,
  runExport: false,
  runEchoEnv: false,
  runPrintf: false,
  runAlias: false,
  runAliasList: false,
  runHistory: false,
  runType: false,
  runJobs: false,
  runFg: false,
  runBg: false,
  runKill: false,
  runJobsAfterKill: false,
  runDemoStart: false,
  runCtrlC: false,
  runDemoSuspend: false,
  runJobsStopped: false,
  runCtrlP: false,
  runCtrlL: false,
  runCdDash: false,
  runBangBang: false,
  runBangPrefix: false,
  runBangNumber: false,
  runCaretSubstitute: false,
  runExitStatus: false,
  exitTerminal: false,
};

export const initialConsoleState: ConsoleState = {
  mode: "login",
  loginName: "",
  password: "",
  command: "",
  lines: [
    "AlmaLinux 9.4 (Seafoam Ocelot)",
    "Kernel 5.14.0-427.13.1.el9_4.x86_64",
    `Virtual console tty3 on ${CONSOLE_HOSTNAME}`,
    "",
    "Type a user name to sign in.",
    "",
  ],
};

export const initialTerminalState: TerminalState = {
  cwd: "/home/student",
  previousCwd: null,
  command: "",
  lines: ["AlmaLinux Terminal", "Type pwd, cd, echo, or exit."],
  env: {},
  aliases: {},
  history: [],
  historyIndex: null,
  lastExitStatus: 0,
  jobs: [],
  foregroundJobId: null,
};

export const initialState: SimulatorState = {
  screen: "lessonSelect",
  loginError: null,
  lessonStartError: null,
  activeUser: LESSON_USERNAME,
  windows: [],
  focusedWindowId: null,
  selectedLessonId: null,
  completedLessons: {},
  completedSteps: emptyCompletedSteps,
  consoleState: initialConsoleState,
  terminalState: initialTerminalState,
  nextZ: 10,
};

export function getLessonById(lessonId: string | null) {
  return lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

function getActiveLesson(state: SimulatorState) {
  return getLessonById(state.selectedLessonId);
}

function getAppWindowDefaults(appId: AppId, z: number): SimWindow | null {
  if (appId === "xeyes") {
    return {
      id: `window-${z}`,
      appId,
      title: "xeyes",
      x: 430,
      y: 190,
      width: 330,
      height: 230,
      z,
      hasMoved: false,
    };
  }

  if (appId === "files") {
    return {
      id: `window-${z}`,
      appId,
      title: "Files - /home/student",
      x: 260,
      y: 120,
      width: 620,
      height: 410,
      z,
      hasMoved: false,
    };
  }

  if (appId === "terminal") {
    return {
      id: `window-${z}`,
      appId,
      title: "Terminal",
      x: 300,
      y: 145,
      width: 680,
      height: 420,
      z,
      hasMoved: false,
    };
  }

  return null;
}

function launchStepFor(appId: AppId): Partial<Record<LessonStepId, boolean>> {
  if (appId === "xeyes") {
    return { launchXeyes: true };
  }
  if (appId === "files") {
    return { launchFiles: true };
  }
  if (appId === "terminal") {
    return { launchTerminal: true };
  }
  return {};
}

function stopStepFor(appId: AppId): Partial<Record<LessonStepId, boolean>> {
  if (appId === "xeyes") {
    return { stopXeyes: true };
  }
  if (appId === "files") {
    return { stopFiles: true };
  }
  return {};
}

function resetSessionForLesson(state: SimulatorState, lesson: Lesson): SimulatorState {
  const terminalState: TerminalState =
    lesson.id === "builtin-command-practice-2"
      ? {
          ...initialTerminalState,
          lines: [
            "AlmaLinux Terminal",
            "Practice export, printf, alias, history, type, jobs, fg, bg, kill, and exit.",
          ],
          env: {},
          aliases: {},
          history: [],
          jobs: [{ id: 1, name: "sample-task", state: "Stopped", background: true }],
          foregroundJobId: null,
        }
      : lesson.id === "shell-shortcut-practice-1"
        ? {
            ...initialTerminalState,
            lines: [
              "AlmaLinux Terminal",
              "Practice Ctrl + c, Ctrl + z, Ctrl + d, Ctrl + p, and Ctrl + l.",
            ],
            history: [],
            jobs: [],
            foregroundJobId: null,
          }
        : lesson.id === "shell-shortcut-practice-2"
          ? {
              ...initialTerminalState,
              lines: [
                "AlmaLinux Terminal",
                "Practice cd -, !!, !prefix, !n, ^old^new, false, echo $?, and exit.",
              ],
              history: [],
              jobs: [],
              foregroundJobId: null,
            }
      : { ...initialTerminalState, lines: [...initialTerminalState.lines] };

  return {
    ...state,
    screen: lesson.startScreen,
    loginError: null,
    lessonStartError: null,
    windows: [],
    focusedWindowId: null,
    selectedLessonId: lesson.id,
    completedSteps: { ...emptyCompletedSteps },
    consoleState: { ...initialConsoleState, lines: [...initialConsoleState.lines] },
    terminalState,
    nextZ: 10,
  };
}

function terminalDisplayCwd(cwd: string) {
  return cwd === "/home/student" ? "~" : cwd.replace("/home/student/", "~/");
}

function terminalPrompt(state: TerminalState) {
  return `[student@${CONSOLE_HOSTNAME} ${terminalDisplayCwd(state.cwd)}]$ ${state.command}`;
}

function normalizeTerminalPath(cwd: string, target: string) {
  const home = "/home/student";
  const allowed = new Set([
    home,
    `${home}/Desktop`,
    `${home}/Documents`,
    `${home}/Downloads`,
    `${home}/Pictures`,
    "/tmp",
  ]);
  const trimmed = target.trim();

  if (trimmed === "" || trimmed === "~" || trimmed === home) {
    return home;
  }

  if (trimmed === "..") {
    return cwd === home ? home : home;
  }

  const candidate = trimmed.startsWith("/")
    ? trimmed
    : `${cwd === home ? home : cwd}/${trimmed}`;

  const parts = candidate.split("/").filter(Boolean);
  const normalizedParts: string[] = [];
  for (const part of parts) {
    if (part === ".") {
      continue;
    }
    if (part === "..") {
      normalizedParts.pop();
      continue;
    }
    normalizedParts.push(part);
  }
  const normalized = `/${normalizedParts.join("/")}`;

  return allowed.has(normalized) ? normalized : null;
}

function shellEchoText(text: string, env: Record<string, string>, lastExitStatus: number) {
  const trimmed = text.trimStart();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === "$?") {
    return String(lastExitStatus);
  }
  if (trimmed.startsWith("$") && /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed.slice(1))) {
    return env[trimmed.slice(1)] ?? "";
  }
  return trimmed;
}

function expandHistoryCommand(command: string, history: string[]) {
  if (command === "!!") {
    const previousCommand = history.at(-1);
    if (!previousCommand) {
      return { error: "bash: !!: event not found" };
    }

    return { expandedCommand: previousCommand, echoedLine: previousCommand };
  }

  if (/^!\d+$/.test(command)) {
    const historyNumber = Number(command.slice(1));
    const matchedCommand = history[historyNumber - 1];
    if (!matchedCommand) {
      return { error: `bash: ${command}: event not found` };
    }

    return { expandedCommand: matchedCommand, echoedLine: matchedCommand };
  }

  if (command.startsWith("!") && command.length > 1) {
    const prefix = command.slice(1);
    const matchedCommand = [...history].reverse().find((entry) => entry.startsWith(prefix));
    if (!matchedCommand) {
      return { error: `bash: ${command}: event not found` };
    }

    return { expandedCommand: matchedCommand, echoedLine: matchedCommand };
  }

  if (command.startsWith("^")) {
    const parts = command.split("^");
    if (parts.length >= 3) {
      const from = parts[1];
      const to = parts[2];
      const previousCommand = history.at(-1);

      if (!previousCommand || !from || !previousCommand.includes(from)) {
        return { error: `bash: ${command}: substitution failed` };
      }

      const substitutedCommand = previousCommand.replace(from, to);
      return { expandedCommand: substitutedCommand, echoedLine: substitutedCommand };
    }
  }

  return { expandedCommand: command, echoedLine: null };
}

function terminalStateForReset() {
  return { ...initialTerminalState, lines: [...initialTerminalState.lines] };
}

function hasFocusedTerminal(state: SimulatorState) {
  const focusedWindow = state.windows.find((window) => window.id === state.focusedWindowId);
  return focusedWindow?.appId === "terminal";
}

function foregroundJobBlocksShellInput(state: SimulatorState) {
  if (state.terminalState.foregroundJobId === null) {
    return false;
  }

  return state.terminalState.jobs.some(
    (job) => job.id === state.terminalState.foregroundJobId && job.name === "demo-long" && job.state === "Running",
  );
}

function canAcceptTerminalInput(state: SimulatorState) {
  return hasFocusedTerminal(state) && !foregroundJobBlocksShellInput(state);
}

function closeTerminalWindow(state: SimulatorState) {
  const terminalWindow = state.windows.find((window) => window.appId === "terminal");
  const nextWindows = state.windows.filter((window) => window.appId !== "terminal");
  return {
    ...state,
    windows: nextWindows,
    focusedWindowId: state.focusedWindowId === terminalWindow?.id ? null : state.focusedWindowId,
    completedSteps: { ...state.completedSteps, exitTerminal: true },
    terminalState: terminalStateForReset(),
  };
}

function getNextJobId(jobs: TerminalState["jobs"]) {
  return jobs.reduce((maxId, job) => Math.max(maxId, job.id), 0) + 1;
}

function recallTerminalHistory(state: SimulatorState, direction: "prev" | "next") {
  const { history, historyIndex } = state.terminalState;
  if (history.length === 0) {
    return state;
  }

  if (direction === "prev") {
    const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
    return {
      ...state,
      completedSteps: { ...state.completedSteps, runCtrlP: true },
      terminalState: {
        ...state.terminalState,
        command: history[nextIndex],
        historyIndex: nextIndex,
      },
    };
  }

  if (historyIndex === null) {
    return state;
  }

  const nextIndex = historyIndex + 1;
  const nextCommand = nextIndex >= history.length ? "" : history[nextIndex];
  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      ...(nextIndex >= history.length && nextCommand === "" ? { runCtrlN: true } : {}),
    },
    terminalState: {
      ...state.terminalState,
      command: nextCommand,
      historyIndex: nextIndex >= history.length ? null : nextIndex,
    },
  };
}

function interruptForegroundJob(state: SimulatorState, mode: "interrupt" | "stop") {
  const { foregroundJobId, jobs } = state.terminalState;
  if (foregroundJobId === null) {
    return state;
  }

  const job = jobs.find((candidate) => candidate.id === foregroundJobId);
  if (!job) {
    return state;
  }

  const nextState: TerminalState["jobs"][number]["state"] =
    mode === "interrupt" ? "Terminated" : "Stopped";
  const nextLines =
    mode === "interrupt"
      ? [...state.terminalState.lines, `^C`, `[${job.id}]+  Terminated      ${job.name}`]
      : [...state.terminalState.lines, `^Z`, `[${job.id}]+  Stopped         ${job.name}`];

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      ...(mode === "interrupt" ? { runCtrlC: true } : { runJobsStopped: state.completedSteps.runJobsStopped }),
    },
    terminalState: {
      ...state.terminalState,
      lines: nextLines,
      foregroundJobId: null,
      jobs: jobs.map((candidate) =>
        candidate.id === foregroundJobId
          ? { ...candidate, state: nextState, background: mode === "stop" }
          : candidate,
      ),
      command: "",
      historyIndex: null,
    },
  };
}

function appendTerminalPrompt(state: TerminalState) {
  return [...state.lines, terminalPrompt(state)];
}

function completeTerminalStep(
  state: SimulatorState,
  stepId: LessonStepId,
  terminalState: TerminalState,
  extraCompletedSteps: Partial<Record<LessonStepId, boolean>> = {},
): SimulatorState {
  return {
    ...state,
    completedSteps: { ...state.completedSteps, ...extraCompletedSteps, [stepId]: true },
    terminalState,
  };
}

function formatJob(job: TerminalState["jobs"][number]) {
  const marker = job.background ? `[${job.id}]` : `${job.id}`;
  return `${marker}  ${job.state.padEnd(10, " ")} ${job.name}`;
}

function runTerminalCommand(state: SimulatorState): SimulatorState {
  const rawCommand = state.terminalState.command.trim();
  const nextLines = appendTerminalPrompt(state.terminalState);
  const expansion = expandHistoryCommand(rawCommand, state.terminalState.history);

  if (expansion.error) {
    return {
      ...state,
      terminalState: {
        ...state.terminalState,
        command: "",
        lines: [...nextLines, expansion.error],
        historyIndex: null,
        lastExitStatus: 1,
      },
    };
  }

  const command = expansion.expandedCommand ?? rawCommand;
  const historyEchoLines = expansion.echoedLine ? [expansion.echoedLine] : [];
  const shortcutCompletedSteps: Partial<Record<LessonStepId, boolean>> = {
    ...(rawCommand === "!!" && command !== rawCommand ? { runBangBang: true } : {}),
    ...(/^!\d+$/.test(rawCommand) && command !== rawCommand ? { runBangNumber: true } : {}),
    ...(rawCommand.startsWith("!") && rawCommand !== "!!" && !/^!\d+$/.test(rawCommand) && command !== rawCommand
      ? { runBangPrefix: true }
      : {}),
    ...(rawCommand.startsWith("^") && command !== rawCommand ? { runCaretSubstitute: true } : {}),
  };
  const nextHistory = command ? [...state.terminalState.history, command] : state.terminalState.history;
  const nextBaseState = {
    ...state.terminalState,
    command: "",
    history: nextHistory,
    historyIndex: null,
  };

  if (command === "demo-long") {
    const jobId = getNextJobId(nextBaseState.jobs);
    const nextStepId = state.completedSteps.runCtrlC ? "runDemoSuspend" : "runDemoStart";
    return completeTerminalStep(state, nextStepId, {
      ...nextBaseState,
      foregroundJobId: jobId,
      jobs: [...nextBaseState.jobs, { id: jobId, name: "demo-long", state: "Running", background: false }],
      lines: [...nextLines, ...historyEchoLines, `demo-long: running in foreground (job ${jobId})`],
      lastExitStatus: 0,
    });
  }

  if (command === "pwd") {
    return {
      ...state,
      completedSteps: { ...state.completedSteps, ...shortcutCompletedSteps, runPwd: true },
      terminalState: {
        ...nextBaseState,
        lines: [...nextLines, ...historyEchoLines, state.terminalState.cwd],
        lastExitStatus: 0,
      },
    };
  }

  if (command === "cd" || command.startsWith("cd ")) {
    const target = command.slice(2).trim();
    const nextPath = target === "-" ? state.terminalState.previousCwd : normalizeTerminalPath(state.terminalState.cwd, target);
    const nextCompletedSteps =
      target === "-" && nextPath
        ? { ...state.completedSteps, ...shortcutCompletedSteps, runCdDash: true }
        : nextPath
          ? { ...state.completedSteps, ...shortcutCompletedSteps, runCd: true }
          : state.completedSteps;
    return {
      ...state,
      completedSteps: nextCompletedSteps,
      terminalState: {
        ...nextBaseState,
        previousCwd: nextPath ? state.terminalState.cwd : state.terminalState.previousCwd,
        cwd: nextPath ?? state.terminalState.cwd,
        lines: nextPath
          ? [...nextLines, ...historyEchoLines, ...(target === "-" ? [nextPath] : [])]
          : [...nextLines, ...historyEchoLines, `cd: ${target}: No such file or directory`],
        lastExitStatus: nextPath ? 0 : 1,
      },
    };
  }

  if (command === "echo" || command.startsWith("echo ")) {
    const echoText = shellEchoText(command.slice(4), nextBaseState.env, state.terminalState.lastExitStatus);
    const completedSteps = { ...state.completedSteps, ...shortcutCompletedSteps, runEcho: true };
    if (command === "echo $COURSE" && nextBaseState.env.COURSE === "linux") {
      completedSteps.runEchoEnv = true;
    }
    if (rawCommand === "echo $?" && state.terminalState.lastExitStatus === 1) {
      completedSteps.runExitStatus = true;
    }

    return {
      ...state,
      completedSteps,
      terminalState: {
        ...nextBaseState,
        lines: [...nextLines, ...historyEchoLines, echoText],
        lastExitStatus: 0,
      },
    };
  }

  if (command === "export COURSE=linux") {
    return completeTerminalStep(state, "runExport", {
      ...nextBaseState,
      env: { ...nextBaseState.env, COURSE: "linux" },
      lines: [...nextLines, ...historyEchoLines],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === 'printf "Hello\\n"') {
    return completeTerminalStep(state, "runPrintf", {
      ...nextBaseState,
      lines: [...nextLines, ...historyEchoLines, "Hello"],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "alias ll='ls -l'") {
    return completeTerminalStep(state, "runAlias", {
      ...nextBaseState,
      aliases: { ...nextBaseState.aliases, ll: "ls -l" },
      lines: [...nextLines, ...historyEchoLines],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "alias") {
    const aliasLines = Object.entries(nextBaseState.aliases).map(([name, value]) => `${name}='${value}'`);
    const completedSteps = { ...state.completedSteps, ...shortcutCompletedSteps };
    if (nextBaseState.aliases.ll === "ls -l") {
      completedSteps.runAliasList = true;
    }

    return {
      ...state,
      completedSteps,
      terminalState: {
        ...nextBaseState,
        lines: [...nextLines, ...historyEchoLines, ...aliasLines],
        lastExitStatus: 0,
      },
    };
  }

  if (command === "history") {
    return completeTerminalStep(state, "runHistory", {
      ...nextBaseState,
      lines: [
        ...nextLines,
        ...nextHistory.map((entry, index) => `${String(index + 1).padStart(4, " ")}  ${entry}`),
      ],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "type cd") {
    return completeTerminalStep(state, "runType", {
      ...nextBaseState,
      lines: [...nextLines, ...historyEchoLines, "cd is a shell builtin"],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "jobs") {
    const activeJobs = nextBaseState.jobs.filter((job) => job.state !== "Terminated");
    const completedSteps = { ...state.completedSteps, ...shortcutCompletedSteps, runJobs: true };
    if (state.completedSteps.runKill && activeJobs.length === 0) {
      completedSteps.runJobsAfterKill = true;
    }
    if (activeJobs.some((job) => job.name === "demo-long" && job.state === "Stopped")) {
      completedSteps.runJobsStopped = true;
    }

    return {
      ...state,
      completedSteps,
      terminalState: {
        ...nextBaseState,
        lines: [...nextLines, ...historyEchoLines, ...activeJobs.map(formatJob)],
        lastExitStatus: 0,
      },
    };
  }

  if (command === "fg %1") {
    const job = nextBaseState.jobs.find((candidate) => candidate.id === 1 && candidate.state !== "Terminated");
    if (!job) {
      return {
        ...state,
        terminalState: {
          ...nextBaseState,
          lines: [...nextLines, ...historyEchoLines, "fg: %1: no such job"],
          lastExitStatus: 1,
        },
      };
    }

    return completeTerminalStep(state, "runFg", {
      ...nextBaseState,
      foregroundJobId: 1,
      jobs: nextBaseState.jobs.map((candidate) =>
        candidate.id === 1 ? { ...candidate, state: "Running", background: false } : candidate,
      ),
      lines: [...nextLines, ...historyEchoLines, "sample-task"],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "bg %1") {
    const job = nextBaseState.jobs.find((candidate) => candidate.id === 1 && candidate.state !== "Terminated");
    if (!job) {
      return {
        ...state,
        terminalState: {
          ...nextBaseState,
          lines: [...nextLines, ...historyEchoLines, "bg: %1: no such job"],
          lastExitStatus: 1,
        },
      };
    }

    return completeTerminalStep(state, "runBg", {
      ...nextBaseState,
      foregroundJobId: null,
      jobs: nextBaseState.jobs.map((candidate) =>
        candidate.id === 1 ? { ...candidate, state: "Running", background: true } : candidate,
      ),
      lines: [...nextLines, ...historyEchoLines, "[1] sample-task &"],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "kill %1") {
    const job = nextBaseState.jobs.find((candidate) => candidate.id === 1 && candidate.state !== "Terminated");
    if (!job) {
      return {
        ...state,
        terminalState: {
          ...nextBaseState,
          lines: [...nextLines, ...historyEchoLines, "kill: %1: no such job"],
          lastExitStatus: 1,
        },
      };
    }

    return completeTerminalStep(state, "runKill", {
      ...nextBaseState,
      foregroundJobId: null,
      jobs: nextBaseState.jobs.map((candidate) =>
        candidate.id === 1 ? { ...candidate, state: "Terminated", background: false } : candidate,
      ),
      lines: [...nextLines, ...historyEchoLines, "[1]+  Terminated      sample-task"],
      lastExitStatus: 0,
    }, shortcutCompletedSteps);
  }

  if (command === "false") {
    return {
      ...state,
      completedSteps: { ...state.completedSteps, ...shortcutCompletedSteps },
      terminalState: {
        ...nextBaseState,
        lines: [...nextLines, ...historyEchoLines],
        lastExitStatus: 1,
      },
    };
  }

  if (command === "exit") {
    return closeTerminalWindow(state);
  }

  return {
    ...state,
    completedSteps: { ...state.completedSteps, ...shortcutCompletedSteps },
    terminalState: {
      ...nextBaseState,
      lines: command ? [...nextLines, ...historyEchoLines, `${command}: command not found`] : nextLines,
      lastExitStatus: command ? 127 : 0,
    },
  };
}

function completeLessonIfReady(
  state: SimulatorState,
  completedSteps: Record<LessonStepId, boolean>,
) {
  const lesson = getActiveLesson(state);
  const lessonComplete = !!lesson && lesson.steps.every((step) => completedSteps[step.id]);

  return {
    ...state.completedLessons,
    ...(lesson && lessonComplete ? { [lesson.id]: true } : {}),
  };
}

function promptLine(consoleState: ConsoleState) {
  if (consoleState.mode === "login") {
    return `${CONSOLE_HOSTNAME} login: ${consoleState.loginName}`;
  }
  if (consoleState.mode === "password") {
    return "Password:";
  }
  return `[${LESSON_USERNAME}@${CONSOLE_HOSTNAME} ~]$ ${consoleState.command}`;
}

export function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction,
): SimulatorState {
  switch (action.type) {
    case "lesson.start": {
      const lesson = getLessonById(action.lessonId);
      if (!lesson?.enabled) {
        return state;
      }

      const hasValidAccessPassword =
        !lesson.accessPassword ||
        action.accessPassword === lesson.accessPassword ||
        action.accessPassword === INSTRUCTOR_LESSON_PASSWORD;

      if (!hasValidAccessPassword) {
        return {
          ...state,
          lessonStartError: {
            lessonId: action.lessonId,
            message: "開始パスワードが違います。講師から案内されたパスワードを入力してください。",
          },
        };
      }

      return resetSessionForLesson(state, lesson);
    }
    case "lesson.startError.reset":
      return { ...state, lessonStartError: null };
    case "login.submit": {
      if (state.selectedLessonId === "console-from-gui") {
        return {
          ...state,
          loginError: "この課題ではGUIログインは使用しません。Ctrl + Alt + F3でコンソールへ切り替えてください。",
        };
      }

      if (action.username !== LESSON_USERNAME || action.password !== LESSON_PASSWORD) {
        return {
          ...state,
          loginError: "ユーザー名またはパスワードが違います。教材用アカウントは student / student です。",
        };
      }

      return {
        ...state,
        screen: "desktop",
        loginError: null,
        activeUser: action.username,
        completedSteps: { ...state.completedSteps, login: true },
      };
    }
    case "login.resetError":
      return { ...state, loginError: null };
    case "overview.open":
      if (state.screen === "login" || state.screen === "lessonSelect") {
        return state;
      }

      return {
        ...state,
        screen: "overview",
        completedSteps: { ...state.completedSteps, overview: true },
      };
    case "overview.close":
      return state.screen === "overview" ? { ...state, screen: "desktop" } : state;
    case "console.switch":
      if (state.screen !== "login") {
        return state;
      }

      return {
        ...state,
        screen: "consoleLogin",
        loginError: null,
        completedSteps: { ...state.completedSteps, switchConsole: true },
        consoleState: { ...initialConsoleState, lines: [...initialConsoleState.lines] },
      };
    case "console.returnGui": {
      if (state.screen !== "consoleLogin") {
        return state;
      }

      const nextCompletedSteps = { ...state.completedSteps, returnGui: true };
      const nextCompletedLessons = completeLessonIfReady(state, nextCompletedSteps);
      const completedCurrentLesson =
        !!state.selectedLessonId && nextCompletedLessons[state.selectedLessonId];
      return {
        ...state,
        screen: completedCurrentLesson ? "lessonSelect" : "login",
        selectedLessonId: completedCurrentLesson ? null : state.selectedLessonId,
        consoleState: { ...initialConsoleState, lines: [...initialConsoleState.lines] },
        completedSteps: nextCompletedSteps,
        completedLessons: nextCompletedLessons,
      };
    }
    case "console.type":
      if (state.screen !== "consoleLogin" || action.value.length === 0) {
        return state;
      }

      if (state.consoleState.mode === "login") {
        return {
          ...state,
          consoleState: {
            ...state.consoleState,
            loginName: `${state.consoleState.loginName}${action.value}`,
          },
        };
      }

      if (state.consoleState.mode === "password") {
        return {
          ...state,
          consoleState: {
            ...state.consoleState,
            password: `${state.consoleState.password}${action.value}`,
          },
        };
      }

      return {
        ...state,
        consoleState: {
          ...state.consoleState,
          command: `${state.consoleState.command}${action.value}`,
        },
      };
    case "console.backspace":
      if (state.screen !== "consoleLogin") {
        return state;
      }

      if (state.consoleState.mode === "login") {
        return {
          ...state,
          consoleState: {
            ...state.consoleState,
            loginName: state.consoleState.loginName.slice(0, -1),
          },
        };
      }

      if (state.consoleState.mode === "password") {
        return {
          ...state,
          consoleState: {
            ...state.consoleState,
            password: state.consoleState.password.slice(0, -1),
          },
        };
      }

      return {
        ...state,
        consoleState: {
          ...state.consoleState,
          command: state.consoleState.command.slice(0, -1),
        },
      };
    case "console.enter": {
      if (state.screen !== "consoleLogin") {
        return state;
      }

      if (state.consoleState.mode === "login") {
        return {
          ...state,
          consoleState: {
            ...state.consoleState,
            mode: "password",
            lines: [...state.consoleState.lines, promptLine(state.consoleState)],
          },
        };
      }

      if (state.consoleState.mode === "password") {
        const loginOk =
          state.consoleState.loginName === LESSON_USERNAME &&
          state.consoleState.password === LESSON_PASSWORD;

        if (!loginOk) {
          return {
            ...state,
            consoleState: {
              ...initialConsoleState,
              lines: [...state.consoleState.lines, "Password:", "", "Login incorrect", ""],
            },
          };
        }

        return {
          ...state,
          completedSteps: { ...state.completedSteps, consoleLogin: true },
          consoleState: {
            ...state.consoleState,
            mode: "shell",
            password: "",
            command: "",
            lines: [
              ...state.consoleState.lines,
              "Password:",
              "",
              "Last login: Sat May  9 20:30:00 on tty3",
            ],
          },
        };
      }

      if (state.consoleState.command.trim() === "exit" || state.consoleState.command.trim() === "logout") {
        return {
          ...state,
          completedSteps: { ...state.completedSteps, consoleLogout: true },
          consoleState: {
            ...initialConsoleState,
            lines: [
              ...state.consoleState.lines,
              promptLine(state.consoleState),
              "logout",
              "",
              ...initialConsoleState.lines,
            ],
          },
        };
      }

      return {
        ...state,
        consoleState: {
          ...state.consoleState,
          command: "",
          lines: [
            ...state.consoleState.lines,
            promptLine(state.consoleState),
            `${state.consoleState.command.trim()}: command not found`,
          ],
        },
      };
    }
    case "terminal.type": {
      if (!canAcceptTerminalInput(state) || action.value.length === 0) {
        return state;
      }

      return {
        ...state,
        terminalState: {
          ...state.terminalState,
          command: `${state.terminalState.command}${action.value}`,
          historyIndex: null,
        },
      };
    }
    case "terminal.backspace": {
      if (!canAcceptTerminalInput(state)) {
        return state;
      }

      return {
        ...state,
        terminalState: {
          ...state.terminalState,
          command: state.terminalState.command.slice(0, -1),
          historyIndex: null,
        },
      };
    }
    case "terminal.enter": {
      if (!canAcceptTerminalInput(state)) {
        return state;
      }

      return runTerminalCommand(state);
    }
    case "terminal.ctrlC":
      if (!hasFocusedTerminal(state)) {
        return state;
      }

      return interruptForegroundJob(state, "interrupt");
    case "terminal.ctrlZ":
      if (!hasFocusedTerminal(state)) {
        return state;
      }

      return interruptForegroundJob(state, "stop");
    case "terminal.ctrlD":
      if (!canAcceptTerminalInput(state) || state.terminalState.command.length > 0) {
        return state;
      }

      return closeTerminalWindow(state);
    case "terminal.historyPrev":
      if (!canAcceptTerminalInput(state)) {
        return state;
      }

      return recallTerminalHistory(state, "prev");
    case "terminal.historyNext":
      if (!canAcceptTerminalInput(state)) {
        return state;
      }

      return recallTerminalHistory(state, "next");
    case "terminal.clear":
      if (!canAcceptTerminalInput(state)) {
        return state;
      }

      return {
        ...state,
        completedSteps: { ...state.completedSteps, runCtrlL: true },
        terminalState: {
          ...state.terminalState,
          command: "",
          lines: [],
          historyIndex: null,
        },
      };
    case "app.launch": {
      const newWindow = getAppWindowDefaults(action.appId, state.nextZ);
      if (!newWindow) {
        return state;
      }

      const existing = state.windows.find((window) => window.appId === action.appId);
      if (existing) {
        return {
          ...state,
          screen: "desktop",
          focusedWindowId: existing.id,
          nextZ: state.nextZ + 1,
          completedSteps: { ...state.completedSteps, ...launchStepFor(action.appId) },
          windows: state.windows.map((window) =>
            window.id === existing.id ? { ...window, z: state.nextZ } : window,
          ),
        };
      }

      return {
        ...state,
        screen: "desktop",
        focusedWindowId: newWindow.id,
        windows: [...state.windows, newWindow],
        nextZ: state.nextZ + 1,
        completedSteps: { ...state.completedSteps, ...launchStepFor(action.appId) },
      };
    }
    case "window.focus":
      return {
        ...state,
        focusedWindowId: action.windowId,
        nextZ: state.nextZ + 1,
        windows: state.windows.map((window) =>
          window.id === action.windowId ? { ...window, z: state.nextZ } : window,
        ),
      };
    case "window.close": {
      const closedWindow = state.windows.find((window) => window.id === action.windowId);
      const nextWindows = state.windows.filter((window) => window.id !== action.windowId);
      return {
        ...state,
        windows: nextWindows,
        completedSteps: closedWindow
          ? { ...state.completedSteps, ...stopStepFor(closedWindow.appId) }
          : state.completedSteps,
        focusedWindowId:
          state.focusedWindowId === action.windowId
            ? (nextWindows.at(-1)?.id ?? null)
            : state.focusedWindowId,
      };
    }
    case "window.move":
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.windowId
            ? { ...window, x: action.x, y: action.y, hasMoved: true }
            : window,
        ),
      };
    case "window.resize":
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.windowId
            ? { ...window, width: action.width, height: action.height }
            : window,
        ),
      };
    case "session.logout": {
      const nextCompletedSteps = { ...state.completedSteps, logout: true };
      const lesson = getActiveLesson(state);
      const lessonComplete =
        !!lesson && lesson.steps.every((step) => nextCompletedSteps[step.id]);

      return {
        ...state,
        screen: "lessonSelect",
        loginError: null,
        windows: [],
        focusedWindowId: null,
        selectedLessonId: null,
        completedSteps: nextCompletedSteps,
        completedLessons:
          lesson && lessonComplete
            ? { ...state.completedLessons, [lesson.id]: true }
            : state.completedLessons,
      };
    }
    default:
      return state;
  }
}

export function getLessonProgress(state: SimulatorState) {
  const lesson = getActiveLesson(state);
  const steps = lesson?.steps ?? [];
  const completed = steps.filter((step) => state.completedSteps[step.id]).length;
  return {
    completed,
    total: steps.length,
    percent: steps.length === 0 ? 0 : Math.round((completed / steps.length) * 100),
  };
}
