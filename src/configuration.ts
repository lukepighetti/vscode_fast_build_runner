import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';

export const enum CommandPrefix {
    dart,
    fvmDart,
}
export class Configuration {
    public static commandPrefix(): CommandPrefix {
        switch (vscode.workspace.getConfiguration('build-runner').get('commandPrefix')) {
            case "dart": return CommandPrefix.dart;
            case "fvm dart": return CommandPrefix.fvmDart;
            default: return CommandPrefix.dart;
        }
    }
}
export class Mappers{
    public static mapCommandPrefixToRaw(commandPrefix: CommandPrefix) {
        switch (commandPrefix) {
            case CommandPrefix.fvmDart: return "fvm dart";
            default: return "dart";
        }
    }

}