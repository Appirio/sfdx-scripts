import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { exec } from 'child_process';
import {
  parseSfdxScriptLibrary,
  ScriptSection,
  ScriptSfdxCommand,
  ScriptSubScript,
  SfdxScript,
  StepKind
} from '../sfdxScripts';

// tslint:disable-next-line ordered-imports
import chalk from 'chalk';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('@appirio/sfdx-scripts', 'org');

export default class Run extends SfdxCommand {

  public static description = messages.getMessage('runCommandDescription');

  public static examples = [
    '$ sfdx run standup'
  ];

  public static args = [{
    name: 'script'
  }];

  protected static flagsConfig = {
    verbose: flags.builtin()
  };

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    let log = '';

    // On an exeception, report and set the exit status to 1
    try {
      const name: string = this.args.script;
      const verbose: boolean = this.flags.verbose;
      const scripts: SfdxScript[] = await this.loadScriptLibrary();

      log = await this.executeScript(scripts, name, verbose);
    } catch (err) {
      this.ux.error(chalk.red(err));
      this.exit(1);
    }

    return {
      log: log.split('\n').filter(s => s.length > 0)
    };
  }

  private async loadScriptLibrary(): Promise<SfdxScript[]> {
    const p = await this.project.resolveProjectConfig();
    const plugins = p.plugins instanceof Object ? p.plugins : {};
    const scripts = plugins['scripts'] instanceof Object ? plugins['scripts'] : {};
    return parseSfdxScriptLibrary(scripts);
  }

  private async executeScript(scripts: SfdxScript[], name: string, verbose: boolean): Promise<string> {
    let result = '';

    // Guard: Throw if name is undefined
    if (name === undefined) {
      throw new Error(messages.getMessage('scriptNotDeclared'));
    }

    // Step 1: Find the script to run
    const script: SfdxScript = scripts.find(obj => obj.name === name);

    // Guard: Throw if script is not found
    if (script === undefined) {
      throw new Error(messages.getMessage('scriptNotFound') + ` (${name})`);
    }

    // Step 2: Execute each step
    for (const step of script.steps) {
      switch (step.kind) {
        case StepKind.Script:
          const subscript: ScriptSubScript = step;
          result += await this.executeScript(scripts, subscript.name, verbose);
          break;

        case StepKind.Section:
          const section: ScriptSection = step;
          this.displayHeading(section.label);
          break;

        case StepKind.SfdxCommand:
          const cmd: ScriptSfdxCommand = step;
          this.ux.startSpinner(cmd.command);
          try {
            const stdout = await this.executeCommand(`sfdx ${cmd.command}`);
            result += `$ sfdx ${cmd.command}\n${stdout}`;
            this.ux.stopSpinner(chalk.green(messages.getMessage('done')));
            if (verbose) {
              this.ux.log(chalk.dim(stdout));
            }
            break;

          } catch (err) {
            this.ux.stopSpinner(chalk.red(messages.getMessage('failed')));
            throw err;
          }
          break;

        // The default condition *should* be unreachable
        default:
          throw new Error(messages.getMessage('unsupported step'));
      }
    }

    return result;
  }

  private displayHeading(label: string): void {
    this.ux.error(chalk.dim('=== ') + chalk.bold.blueBright(label));
  }

  private async executeCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
