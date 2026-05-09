import { describe, expect, it } from "vitest";
import { getLessonProgress, initialState, lessons, simulatorReducer } from "./simulator";

function typeTerminalCommand(state: ReturnType<typeof simulatorReducer>, command: string) {
  let nextState = state;
  for (const value of command) {
    nextState = simulatorReducer(nextState, { type: "terminal.type", value });
  }
  return simulatorReducer(nextState, { type: "terminal.enter" });
}

function withTemporarilyEnabledLesson<T>(lessonId: string, run: () => T) {
  const lesson = lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson) {
    throw new Error(`Unknown lesson: ${lessonId}`);
  }

  const previousEnabled = lesson.enabled;
  lesson.enabled = true;

  try {
    return run();
  } finally {
    lesson.enabled = previousEnabled;
  }
}

describe("simulatorReducer", () => {
  it("starts on the lesson selection screen", () => {
    expect(initialState.screen).toBe("lessonSelect");
    expect(initialState.selectedLessonId).toBeNull();
  });

  it("starts an enabled lesson at the configured start screen", () => {
    const state = simulatorReducer(initialState, {
      type: "lesson.start",
      lessonId: "basic-gnome-gui",
    });

    expect(state.screen).toBe("login");
    expect(state.selectedLessonId).toBe("basic-gnome-gui");
    expect(getLessonProgress(state)).toEqual({ completed: 0, total: 7, percent: 0 });
  });

  it("does not start an unknown lesson", () => {
    const state = simulatorReducer(initialState, {
      type: "lesson.start",
      lessonId: "unknown-lesson",
    });

    expect(state).toBe(initialState);
  });

  it("starts a password-protected lesson when the correct password is provided", () => {
    const state = withTemporarilyEnabledLesson("builtin-command-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-1",
        accessPassword: "pass999",
      }),
    );

    expect(state.screen).toBe("login");
    expect(state.selectedLessonId).toBe("builtin-command-practice-1");
    expect(state.lessonStartError).toBeNull();
  });

  it("rejects a password-protected lesson when the password is incorrect", () => {
    const state = withTemporarilyEnabledLesson("builtin-command-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-1",
        accessPassword: "wrong-pass",
      }),
    );

    expect(state.screen).toBe("lessonSelect");
    expect(state.selectedLessonId).toBeNull();
    expect(state.lessonStartError).toEqual({
      lessonId: "builtin-command-practice-1",
      message: "開始パスワードが違います。講師から案内されたパスワードを入力してください。",
    });
  });

  it("requires both the lesson username and password", () => {
    const started = simulatorReducer(initialState, {
      type: "lesson.start",
      lessonId: "basic-gnome-gui",
    });
    const state = simulatorReducer(started, {
      type: "login.submit",
      username: "student",
      password: "wrong",
    });

    expect(state.screen).toBe("login");
    expect(state.loginError).toContain("ユーザー名またはパスワード");
    expect(state.completedSteps.login).toBe(false);
  });

  it("returns to lesson selection and marks the selected lesson complete after logout", () => {
    const started = simulatorReducer(initialState, {
      type: "lesson.start",
      lessonId: "basic-gnome-gui",
    });
    const loggedIn = simulatorReducer(started, {
      type: "login.submit",
      username: "student",
      password: "student",
    });
    const overview = simulatorReducer(loggedIn, { type: "overview.open" });
    const xeyesLaunched = simulatorReducer(overview, { type: "app.launch", appId: "xeyes" });
    const xeyesStopped = simulatorReducer(xeyesLaunched, {
      type: "window.close",
      windowId: xeyesLaunched.windows[0].id,
    });
    const filesLaunched = simulatorReducer(xeyesStopped, { type: "app.launch", appId: "files" });
    const filesStopped = simulatorReducer(filesLaunched, {
      type: "window.close",
      windowId: filesLaunched.windows[0].id,
    });
    const loggedOut = simulatorReducer(filesStopped, { type: "session.logout" });

    expect(loggedOut.screen).toBe("lessonSelect");
    expect(loggedOut.selectedLessonId).toBeNull();
    expect(loggedOut.completedLessons["basic-gnome-gui"]).toBe(true);
  });

  it("marks the console lesson as available and assigns its password", () => {
    const lesson = lessons.find((candidate) => candidate.id === "console-from-gui");

    expect(lesson?.enabled).toBe(true);
    expect(lesson?.accessPassword).toBe("pass123");
    expect(lesson?.steps.map((step) => step.id)).toEqual([
      "switchConsole",
      "consoleLogin",
      "consoleLogout",
      "returnGui",
    ]);
  });

  it("switches from GDM to console login", () => {
    const started = withTemporarilyEnabledLesson("console-from-gui", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "console-from-gui",
        accessPassword: "pass123",
      }),
    );
    const switched = simulatorReducer(started, { type: "console.switch" });

    expect(switched.screen).toBe("consoleLogin");
    expect(switched.completedSteps.switchConsole).toBe(true);
    expect(switched.consoleState.lines[0]).toContain("AlmaLinux 9.4");
  });

  it("blocks GUI login during the console lesson", () => {
    const started = withTemporarilyEnabledLesson("console-from-gui", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "console-from-gui",
        accessPassword: "pass123",
      }),
    );
    const state = simulatorReducer(started, {
      type: "login.submit",
      username: "student",
      password: "student",
    });

    expect(state.screen).toBe("login");
    expect(state.completedSteps.login).toBe(false);
    expect(state.loginError).toContain("GUIログインは使用しません");
  });

  it("logs in and out of the console with exit", () => {
    let state = withTemporarilyEnabledLesson("console-from-gui", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "console-from-gui",
        accessPassword: "pass123",
      }),
    );
    state = simulatorReducer(state, { type: "console.switch" });
    for (const value of "student") {
      state = simulatorReducer(state, { type: "console.type", value });
    }
    state = simulatorReducer(state, { type: "console.enter" });
    for (const value of "student") {
      state = simulatorReducer(state, { type: "console.type", value });
    }
    state = simulatorReducer(state, { type: "console.enter" });

    expect(state.consoleState.mode).toBe("shell");
    expect(state.completedSteps.consoleLogin).toBe(true);

    for (const value of "exit") {
      state = simulatorReducer(state, { type: "console.type", value });
    }
    state = simulatorReducer(state, { type: "console.enter" });

    expect(state.consoleState.mode).toBe("login");
    expect(state.completedSteps.consoleLogout).toBe(true);
  });

  it("marks the console lesson complete after returning to the GUI", () => {
    let state = withTemporarilyEnabledLesson("console-from-gui", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "console-from-gui",
        accessPassword: "pass123",
      }),
    );
    state = simulatorReducer(state, { type: "console.switch" });
    state = {
      ...state,
      completedSteps: {
        ...state.completedSteps,
        consoleLogin: true,
        consoleLogout: true,
      },
    };
    state = simulatorReducer(state, { type: "console.returnGui" });

    expect(state.screen).toBe("lessonSelect");
    expect(state.completedLessons["console-from-gui"]).toBe(true);
  });

  it("marks the builtin command practice lesson as available and assigns its password", () => {
    const lesson = lessons.find((candidate) => candidate.id === "builtin-command-practice-1");

    expect(lesson?.enabled).toBe(true);
    expect(lesson?.accessPassword).toBe("pass999");
    expect(lesson?.steps.map((step) => step.id)).toEqual([
      "login",
      "overview",
      "launchTerminal",
      "runPwd",
      "runCd",
      "runEcho",
      "exitTerminal",
      "logout",
    ]);
  });

  it("runs builtin commands in Terminal and closes it with exit", () => {
    let state = withTemporarilyEnabledLesson("builtin-command-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-1",
        accessPassword: "pass999",
      }),
    );
    state = simulatorReducer(state, {
      type: "login.submit",
      username: "student",
      password: "student",
    });
    state = simulatorReducer(state, { type: "overview.open" });
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });

    expect(state.windows.some((window) => window.appId === "terminal")).toBe(true);
    expect(state.completedSteps.launchTerminal).toBe(true);

    for (const command of ["pwd", "cd /tmp", "pwd", 'echo "Hello"', "exit"]) {
      for (const value of command) {
        state = simulatorReducer(state, { type: "terminal.type", value });
      }
      state = simulatorReducer(state, { type: "terminal.enter" });
    }

    expect(state.completedSteps.runPwd).toBe(true);
    expect(state.completedSteps.runCd).toBe(true);
    expect(state.completedSteps.runEcho).toBe(true);
    expect(state.completedSteps.exitTerminal).toBe(true);
    expect(state.windows.some((window) => window.appId === "terminal")).toBe(false);
  });

  it("marks the shell shortcut practice lesson as available and assigns its password", () => {
    const lesson = lessons.find((candidate) => candidate.id === "shell-shortcut-practice-1");

    expect(lesson?.enabled).toBe(true);
    expect(lesson?.accessPassword).toBe("Pass100");
    expect(lesson?.title).toContain("課題4");
    expect(lesson?.steps.map((step) => step.id)).toEqual([
      "login",
      "overview",
      "launchTerminal",
      "runDemoStart",
      "runCtrlC",
      "runDemoSuspend",
      "runJobsStopped",
      "runCtrlP",
      "runCtrlL",
      "exitTerminal",
      "logout",
    ]);
  });

  it("handles Ctrl shortcuts in the shell shortcut lesson", () => {
    let state = withTemporarilyEnabledLesson("shell-shortcut-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "shell-shortcut-practice-1",
        accessPassword: "Pass100",
      }),
    );
    state = simulatorReducer(state, {
      type: "login.submit",
      username: "student",
      password: "student",
    });
    state = simulatorReducer(state, { type: "overview.open" });
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });

    state = typeTerminalCommand(state, "demo-long");
    expect(state.completedSteps.runDemoStart).toBe(true);
    expect(state.terminalState.foregroundJobId).not.toBeNull();

    const blockedWhileForeground = simulatorReducer(state, { type: "terminal.type", value: "x" });
    expect(blockedWhileForeground.terminalState.command).toBe("");

    state = simulatorReducer(state, { type: "terminal.ctrlC" });
    expect(state.completedSteps.runCtrlC).toBe(true);
    expect(state.terminalState.foregroundJobId).toBeNull();
    expect(state.terminalState.jobs.at(-1)?.state).toBe("Terminated");

    state = typeTerminalCommand(state, "demo-long");
    expect(state.completedSteps.runDemoSuspend).toBe(true);

    state = simulatorReducer(state, { type: "terminal.ctrlZ" });
    expect(state.terminalState.jobs.at(-1)?.state).toBe("Stopped");
    state = typeTerminalCommand(state, "jobs");
    expect(state.completedSteps.runJobsStopped).toBe(true);

    state = typeTerminalCommand(state, "echo history-check");
    state = simulatorReducer(state, { type: "terminal.historyPrev" });
    expect(state.completedSteps.runCtrlP).toBe(true);
    expect(state.terminalState.command).toBe("echo history-check");

    state = simulatorReducer(state, { type: "terminal.clear" });
    expect(state.completedSteps.runCtrlL).toBe(true);
    expect(state.terminalState.lines).toEqual([]);

    state = simulatorReducer(state, { type: "terminal.ctrlD" });
    expect(state.completedSteps.exitTerminal).toBe(true);
    expect(state.windows.some((window) => window.appId === "terminal")).toBe(false);
  });

  it("marks the second shell shortcut practice lesson as available and assigns its password", () => {
    const lesson = lessons.find((candidate) => candidate.id === "shell-shortcut-practice-2");

    expect(lesson?.enabled).toBe(true);
    expect(lesson?.accessPassword).toBe("p@ss200");
    expect(lesson?.title).toContain("課題5");
    expect(lesson?.steps.map((step) => step.id)).toEqual([
      "login",
      "overview",
      "launchTerminal",
      "runCdDash",
      "runBangBang",
      "runBangPrefix",
      "runBangNumber",
      "runCaretSubstitute",
      "runExitStatus",
      "exitTerminal",
      "logout",
    ]);
  });

  it("handles history expansion, cd -, and exit status in the second shell shortcut lesson", () => {
    let state = withTemporarilyEnabledLesson("shell-shortcut-practice-2", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "shell-shortcut-practice-2",
        accessPassword: "p@ss200",
      }),
    );
    state = simulatorReducer(state, {
      type: "login.submit",
      username: "student",
      password: "student",
    });
    state = simulatorReducer(state, { type: "overview.open" });
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });

    state = typeTerminalCommand(state, "pwd");
    expect(state.terminalState.history[0]).toBe("pwd");

    state = typeTerminalCommand(state, "cd /tmp");
    expect(state.terminalState.cwd).toBe("/tmp");

    state = typeTerminalCommand(state, "cd -");
    expect(state.completedSteps.runCdDash).toBe(true);
    expect(state.terminalState.cwd).toBe("/home/student");
    expect(state.terminalState.lines.at(-1)).toBe("/home/student");

    state = typeTerminalCommand(state, "echo repeat-me");
    state = typeTerminalCommand(state, "!!");
    expect(state.completedSteps.runBangBang).toBe(true);
    expect(state.terminalState.history.at(-1)).toBe("echo repeat-me");
    expect(state.terminalState.lines.at(-1)).toBe("repeat-me");

    state = typeTerminalCommand(state, "echo sample-token");
    state = typeTerminalCommand(state, "!echo");
    expect(state.completedSteps.runBangPrefix).toBe(true);
    expect(state.terminalState.history.at(-1)).toBe("echo sample-token");
    expect(state.terminalState.lines.at(-1)).toBe("sample-token");

    state = typeTerminalCommand(state, "history");
    state = typeTerminalCommand(state, "!1");
    expect(state.completedSteps.runBangNumber).toBe(true);
    expect(state.terminalState.history.at(-1)).toBe("pwd");
    expect(state.terminalState.lines.at(-1)).toBe("/home/student");

    state = typeTerminalCommand(state, "echo hoge");
    state = typeTerminalCommand(state, "^hoge^fuga");
    expect(state.completedSteps.runCaretSubstitute).toBe(true);
    expect(state.terminalState.history.at(-1)).toBe("echo fuga");
    expect(state.terminalState.lines.at(-1)).toBe("fuga");

    state = typeTerminalCommand(state, "false");
    expect(state.terminalState.lastExitStatus).toBe(1);

    state = typeTerminalCommand(state, "echo $?");
    expect(state.completedSteps.runExitStatus).toBe(true);
    expect(state.terminalState.lines.at(-1)).toBe("1");

    state = typeTerminalCommand(state, "exit");
    expect(state.completedSteps.exitTerminal).toBe(true);
    expect(state.windows.some((window) => window.appId === "terminal")).toBe(false);
  });

  it("allows /tmp but rejects unsupported absolute paths", () => {
    let state = withTemporarilyEnabledLesson("builtin-command-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-1",
        accessPassword: "pass999",
      }),
    );
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });
    for (const value of "cd /tmp") {
      state = simulatorReducer(state, { type: "terminal.type", value });
    }
    state = simulatorReducer(state, { type: "terminal.enter" });

    expect(state.terminalState.cwd).toBe("/tmp");
    expect(state.completedSteps.runCd).toBe(true);

    for (const value of "cd /etc") {
      state = simulatorReducer(state, { type: "terminal.type", value });
    }
    state = simulatorReducer(state, { type: "terminal.enter" });

    expect(state.terminalState.cwd).toBe("/tmp");
  });

  it("resizes terminal windows independently of moving them", () => {
    let state = withTemporarilyEnabledLesson("builtin-command-practice-1", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-1",
        accessPassword: "pass999",
      }),
    );
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });

    const terminalWindow = state.windows.find((window) => window.appId === "terminal");

    expect(terminalWindow).toBeDefined();

    state = simulatorReducer(state, {
      type: "window.resize",
      windowId: terminalWindow!.id,
      width: 820,
      height: 540,
    });

    const resizedWindow = state.windows.find((window) => window.id === terminalWindow!.id);

    expect(resizedWindow?.width).toBe(820);
    expect(resizedWindow?.height).toBe(540);
    expect(resizedWindow?.x).toBe(terminalWindow?.x);
    expect(resizedWindow?.y).toBe(terminalWindow?.y);
  });

  it("marks the second builtin command practice lesson as available and assigns its password", () => {
    const lesson = lessons.find((candidate) => candidate.id === "builtin-command-practice-2");

    expect(lesson?.enabled).toBe(true);
    expect(lesson?.accessPassword).toBe("pass010");
    expect(lesson?.steps.map((step) => step.id)).toEqual([
      "login",
      "overview",
      "launchTerminal",
      "runExport",
      "runEchoEnv",
      "runPrintf",
      "runAlias",
      "runAliasList",
      "runHistory",
      "runType",
      "runJobs",
      "runFg",
      "runBg",
      "runKill",
      "runJobsAfterKill",
      "exitTerminal",
      "logout",
    ]);
  });

  it("runs builtin command practice 2 with terminal state, history, and jobs", () => {
    let state = withTemporarilyEnabledLesson("builtin-command-practice-2", () =>
      simulatorReducer(initialState, {
        type: "lesson.start",
        lessonId: "builtin-command-practice-2",
        accessPassword: "pass010",
      }),
    );
    state = simulatorReducer(state, {
      type: "login.submit",
      username: "student",
      password: "student",
    });
    state = simulatorReducer(state, { type: "overview.open" });
    state = simulatorReducer(state, { type: "app.launch", appId: "terminal" });

    const runCommand = (command: string) => {
      for (const value of command) {
        state = simulatorReducer(state, { type: "terminal.type", value });
      }
      state = simulatorReducer(state, { type: "terminal.enter" });
    };

    runCommand("export COURSE=linux");
    runCommand("echo $COURSE");
    runCommand('printf "Hello\\n"');
    runCommand("alias ll='ls -l'");
    runCommand("alias");
    runCommand("history");
    runCommand("type cd");
    runCommand("jobs");
    runCommand("fg %1");
    runCommand("bg %1");
    runCommand("kill %1");
    runCommand("jobs");
    runCommand("exit");

    expect(state.completedSteps.runExport).toBe(true);
    expect(state.completedSteps.runEchoEnv).toBe(true);
    expect(state.completedSteps.runPrintf).toBe(true);
    expect(state.completedSteps.runAlias).toBe(true);
    expect(state.completedSteps.runAliasList).toBe(true);
    expect(state.completedSteps.runHistory).toBe(true);
    expect(state.completedSteps.runType).toBe(true);
    expect(state.completedSteps.runJobs).toBe(true);
    expect(state.completedSteps.runFg).toBe(true);
    expect(state.completedSteps.runBg).toBe(true);
    expect(state.completedSteps.runKill).toBe(true);
    expect(state.completedSteps.runJobsAfterKill).toBe(true);
    expect(state.completedSteps.exitTerminal).toBe(true);
    expect(state.windows.some((window) => window.appId === "terminal")).toBe(false);
  });
});
