import chalk from 'chalk';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  statSync,
  readdirSync
} from 'fs';
import { exec } from 'child_process';
import { MethodDeclaration, ParameterDeclaration, SourceFile } from 'ts-morph';
import { Patch } from '../types/patch.types.js';

const execPromise = (command: string): Promise<ExecutionResponse> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}


export type ExecutionResponse = {
  error: any,
  stdout: string,
  stderr: string,
};

export async function execute(command: string, message?: string): Promise<ExecutionResponse> {
  if (message) console.log(chalk.blue(message));
  return execPromise(command);
}

export function applyPatches(patches: Patch, path: string): void {
  try {
    Object.keys((patches)).forEach(patchKey => {
      const patch = patches[patchKey];
      Object.keys(patch).forEach(subPatchKey => {
        const { path: subPath, replacement, searchString } = patch[subPatchKey];
        const filePath = `${path}${subPath}`;
        const data = readFileSync(filePath, 'utf8');
        let replace = false;
        if (data) {
          if (replacement === '') replace = true;
          if (
            replacement !== '' &&
            !data.includes(replacement)
          ) {
            replace = true;
          }
          if (replace) {
            const updatedContent = data.replace(searchString, replacement);
            if (!updatedContent) throw new Error('failed to update the content.');
            writeFileSync(filePath, updatedContent, 'utf8');
            console.log('file updated successfully.');
          }
        } else {
          throw new Error('no content found.');
        }
      });
    });
  } catch (error) {
    throw error;
  }
}

export async function getNpmGlobalDir(): Promise<string> {
  const response: ExecutionResponse = await execute(`npm list -g`);
  if (!response.stdout) return '';
  const lines = response.stdout.split('\n');
  const subdirectory = lines[0].trim();
  return `${subdirectory}/node_modules/@loopback/cli`;
}

// Recursive function to get files
export function getFiles(dir: string, files: string[] = []) {
  if (!existsSync(dir)) return [];
  const fileList = readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

export function isJson(item: string) {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }

  return typeof value === 'object' && value !== null;
}

export function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toPascalCase(str: string) {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
    .join('');
}
export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return '';
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

export function addDecoratorToMethod(
  addDecoratorTo: MethodDeclaration,
  name: string,
  decoratorArguments: string[],
): void {
  const authDecorator = addDecoratorTo?.getDecorator(name);
  if (!authDecorator) {
    addDecoratorTo?.addDecorator({ name, arguments: decoratorArguments });
  }
}

export function addDecoratorToParameter(
  addDecoratorTo: ParameterDeclaration,
  name: string,
  decoratorArguments: string[],
): void {
  const authDecorator = addDecoratorTo?.getDecorator(name);
  if (!authDecorator) {
    addDecoratorTo?.addDecorator({ name, arguments: decoratorArguments });
  }
}

export function addImport(
  addImportTo: SourceFile | undefined,
  defaultImport: string,
  moduleSpecifier: string,
  replace: boolean = false
): void {
  let existingImport = addImportTo?.getImportDeclaration(moduleSpecifier);
  if (!existingImport) {
    addImportTo?.addImportDeclaration({ defaultImport: `{${defaultImport}}`, moduleSpecifier });
  } else {
    existingImport = addImportTo?.getImportDeclaration(moduleSpecifier)!;
    if (replace) {
      existingImport.getNamedImports().forEach((eachImport) => {
        let importText = eachImport.getText();
        const pattern = new RegExp(`\\b${importText}\\b`);
        if (!pattern.test(defaultImport)) {
          defaultImport += `,${importText}`;
        }
      });
      existingImport.remove();
      addImportTo?.addImportDeclaration({ defaultImport: `{${defaultImport}}`, moduleSpecifier });
    }
  }
}

export function isLoopBackApp(packageJson: any) {
  const { dependencies } = packageJson;
  if (!dependencies['@loopback/core']) return false;
  return true;
}