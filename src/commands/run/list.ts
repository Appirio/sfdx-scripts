import { core, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import {
  parseSfdxScriptLibrary,
  SfdxScript
} from '../../sfdxScripts';

// tslint:disable-next-line ordered-imports
import chalk from 'chalk';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('@appirio/sfdx-scripts', 'org');

export default class RunList extends SfdxCommand {

  public static description = messages.getMessage('runListCommandDescription');

  public static examples = [
    '$ sfdx run:list'
  ];

  public static args = [];

  protected static flagsConfig = {};

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const scripts: SfdxScript[] = await this.loadScriptLibrary();
    const names: string[] = scripts.map(script => script.name);

    this.displayHeading(messages.getMessage('scriptListHeading'));

    if (names.length === 0) {
      this.ux.log(chalk.dim(messages.getMessage('noScriptsDefined')));
    }

    names.forEach(n => this.ux.log(n));

    return names;
  }

  private async loadScriptLibrary(): Promise<SfdxScript[]> {
    const p = await this.project.resolveProjectConfig();
    const plugins = p.plugins instanceof Object ? p.plugins : {};
    const scripts = plugins['scripts'] instanceof Object ? plugins['scripts'] : {};
    return parseSfdxScriptLibrary(scripts);
  }

  private displayHeading(label: string): void {
    this.ux.error(chalk.dim('=== ') + chalk.bold.blueBright(label));
  }
}
