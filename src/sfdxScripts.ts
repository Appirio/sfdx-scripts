import {
  envsub
} from './util';

// A script
export interface SfdxScript {
  name: string;
  steps: Array<ScriptSection | ScriptSubScript | ScriptSfdxCommand>;
}

// The kinds of script steps
export enum StepKind { Script, Section, SfdxCommand }

// A decorative step
export interface ScriptSection {
  kind: StepKind.Section;
  label: string;
}

// A step to execute a subscript
export interface ScriptSubScript {
  kind: StepKind.Script;
  name: string;
}

// A step to execute an sfdx command
export interface ScriptSfdxCommand {
  kind: StepKind.SfdxCommand;
  command: string;
}

// Parses the an object into a list of scripts
export const parseSfdxScriptLibrary = (obj: object): SfdxScript[] =>
  Object.entries(obj).map(([key, value]) => {
    return {
      name: key,
      steps: parseSfdxScript([].concat(value))
    } as SfdxScript;
  });

// Parses a list of strings into a list of script steps
const parseSfdxScript = (script: string[]): Array<ScriptSection | ScriptSubScript | ScriptSfdxCommand> => {
  return script.map(parseScriptStep);
};

const SECTION_PREFIX = '#';
const SUBSCRIPT_PREFIX = 'run';
const SUBSCRIPT_PREFIX_ALIAS = '.';

const STEP_PATTERN = /^(#|\.|run(?=\s))?\s*(.+)$/;

const parseScriptStep = (str: string): ScriptSection | ScriptSubScript | ScriptSfdxCommand => {
  const match: string[] = STEP_PATTERN.exec(str);

  // Guard: No pattern match
  if (match === null) {
    throw new Error(`invalid step '${str}'`);
  }

  const prefix: string = match[1];
  const body: string = match[2];

  // Option 1: This is a section
  if (prefix === SECTION_PREFIX) {
    return {
      kind: StepKind.Section,
      label: body
    } as ScriptSection;
  }

  // Option 2: This is subscript
  if (prefix === SUBSCRIPT_PREFIX || prefix === SUBSCRIPT_PREFIX_ALIAS) {
    return {
      kind: StepKind.Script,
      name: body
    } as ScriptSubScript;
  }

  // Otherwise, this is an Sfdx command
  return {
    kind: StepKind.SfdxCommand,
    command: envsub(body)
  } as ScriptSfdxCommand;
};
