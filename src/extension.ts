/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { privateEncrypt } from "crypto";
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "build-runner" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "build-runner.helloWorld",
    async () => {
      // Display a message box to the user

      function _route(): Array<String> | null {
        // The code you place here will be executed every time your command is executed
        const uri = vscode.window.activeTextEditor?.document.uri;
        const path = uri?.path;

        /// Guard against welcome screen
        const isWelcomeScreen = path === undefined;
        if (isWelcomeScreen) return null;

        /// Guard against untitled files
        const isUntitled = vscode.window.activeTextEditor?.document.isUntitled;
        if (isUntitled) return [];

        /// Guard against no workspace name
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri!);
        const workspaceName = workspaceFolder?.name;
        if (workspaceName === undefined) return [];

        console.log(workspaceName);

        /// Guard against no workspace path
        const workspacePath = workspaceFolder?.uri.path;
        if (workspacePath === undefined) [];

        const relativePath = path?.replace(workspacePath!, "");
        const segments = relativePath?.split("/").filter((e) => e !== "");

        /// Guard against no top level folder
        const hasTopLevelFolder = segments!.length > 1;
        if (!hasTopLevelFolder) return [];

        const topLevelProjectFolder = segments![0];
        const topLevelFolder = `${workspacePath}/${topLevelProjectFolder}`;
        const segmentsWithoutFilename = [...segments!].slice(
          0,
          segments!.length - 1
        );
        const bottomLevelFolder = `${workspacePath}/${segmentsWithoutFilename.join(
          "/"
        )}`;
        const targetFile = path;

        /// Guard against common generated files
        const targetIsFreezed = targetFile?.endsWith(".freezed.dart");
        const targetIsGenerated = targetFile?.endsWith(".g.dart");
        if (targetIsFreezed) return [`${bottomLevelFolder}/**`];
        if (targetIsGenerated) return [`${bottomLevelFolder}/**`];

        /// get parts
        const text = vscode.window.activeTextEditor?.document.getText();
        const parts = text
          ?.match(/^part '.*';$/gm)
          ?.map((e) => e.replace(/^part '/, "").replace(/';$/, ""));

        const hasParts = !(
          parts === undefined ||
          parts === null ||
          parts?.length === 0
        );

        if (!hasParts) return [`${bottomLevelFolder}/**`];

        const buildFilters = parts!.map((e) => `${bottomLevelFolder}/${e}`);

        return [...buildFilters];
      }

      const filters = await _route();

      /// Null filters because no workspace, let's ask the user to pick a workspace
      /// so we can run build_runner on it
      if (filters === null) {
        /// Pick a workspace folder
        const result = await vscode.window.showWorkspaceFolderPick();
        const path = result?.uri.path;

        /// No workspace selected intentionally
        if (path === undefined) {
          vscode.window.showInformationMessage(
            `Please select a project to run build_runner in`
          );
        }

        /// Workspace selected, lets run build_runner on it
        else {
          const command = `cd ${path} && dart run build_runner build --delete-conflicting-outputs`;
          const terminal = vscode.window.createTerminal(`build_runner`);

          terminal.sendText(command);
          console.log(command);
        }
      }
      /// We've got an array which means everything worked out.
      /// It might be empty, but that's not a problem. That just
      /// means we won't have any build filters.
      else {
        const buildFilters = filters
          .map((path) => `--build-filter="${path}"`)
          .join(" ");

        const terminal = vscode.window.createTerminal(`build_runner`);

        const command = `dart run build_runner build --delete-conflicting-outputs ${buildFilters}`;

        /// Attempt to build with filters
        terminal.sendText(command);
        console.log(command);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
