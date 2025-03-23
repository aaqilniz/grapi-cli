import chalk from 'chalk';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  statSync,
  readdirSync,
  promises as fsPromises,
  mkdir
} from 'fs';
import { exec, SpawnOptions, spawn } from 'child_process';
import { MethodDeclaration, ParameterDeclaration, SourceFile } from 'ts-morph';
import { Patch } from '../types/patch.types.js';
import { join } from 'path';

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

export function applyPatches(patches: Patch): void {
  try {
    Object.keys((patches)).forEach(patchKey => {
      const patch = patches[patchKey];
      Object.keys(patch).forEach(subPatchKey => {
        let { path: filePath } = patch[subPatchKey];

        const {
          replacement,
          isRegex,
          replaceAll,
        } = patch[subPatchKey];

        let { searchString, } = patch[subPatchKey];
        if (existsSync(filePath)) {
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
              searchString = isRegex ? new RegExp(searchString) : searchString
              const updatedContent = data[replaceAll ? 'replaceAll' : 'replace'](searchString, replacement);
              if (!updatedContent) throw new Error('failed to update the content.');
              writeFileSync(filePath, updatedContent, 'utf8');
              console.log('file updated successfully.');
            }
          } else {
            throw new Error('no content found.');
          }
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

export function prompt(command: string, flags: any, args?: any) {
  let flagString = '', argString = '';

  if (args && Object.keys(args).length) {
    Object.keys(args).forEach(key => { argString += `${args[key]} `; });
    argString = argString.slice(0, -1);
  }
  if (flags && Object.keys(flags).length) {
    Object.keys(flags).forEach(key => {
      const flag = flags[key];
      flagString += `--${key}=${flag} `;
    });
    flagString = flagString.slice(0, -1);
  }


  const options: SpawnOptions = {
    stdio: 'inherit',  // Inherit standard I/O streams from the parent process
    shell: true,       // Run the command in a shell
  };
  let completeCommand = `lb4 ${command}${argString ? ` ${argString}` : ''}${flagString ? ` ${flagString}` : ''}`;

  const lb4 = spawn(`lb4 ${command}${argString ? ` ${argString}` : ''}${flagString ? ` ${flagString}` : ''}`, [], options);

  lb4.on('error', (err: Error) => {
    console.error(`Error starting lb4 command: ${err.message}`);
  });

  lb4.on('close', (code: number | null) => {
    if (code !== null) {
      console.log(`lb4 command exited with code ${code}`);
    } else {
      console.log(`lb4 command was terminated`);
    }
  });
}

export async function copyFiles(srcDir: string, destDir: string, files: string[]): Promise<void[]> {
  if (!existsSync(destDir)) await fsPromises.mkdir(destDir);
  return Promise.all(files.map(file =>
    fsPromises.copyFile(join(srcDir, file), join(destDir, file))
  ));
}

export function findVersionedFile(filePattern: string, directory: string = '.'): string {
  try {
    // Split the pattern around the asterisk
    const [prefix, suffix] = filePattern.split('*');

    // Create different regex patterns based on whether there's content after *
    let regex: RegExp;
    if (suffix && suffix !== '.patch') {
      // Case 1: Pattern has extra content after version (like -build-schema.patch)
      regex = new RegExp(`^${prefix
        .replace(/\./g, '\\.')
        .replace(/\+/g, '\\+')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        }[\\d\\.]+${suffix
          .replace(/\./g, '\\.')
          .replace(/\+/g, '\\+')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)')
        }$`);
    } else {
      // Case 2: Pattern only has version followed by .patch
      regex = new RegExp(`^${prefix
        .replace(/\./g, '\\.')
        .replace(/\+/g, '\\+')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        }[\\d\\.]+\\.patch$`);
    }

    // Read directory contents
    const files = readdirSync(directory);

    // Find matching file
    const matchingFile = files.find((file: string) => regex.test(file));

    if (!matchingFile) {
      throw new Error(`No file found matching pattern: ${filePattern}`);
    }

    return matchingFile;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to find file: ${error.message}`);
    }
    throw new Error('An unknown error occurred while finding the file');
  }
}

export async function removeCodeSection(filePath: string, startPattern: string | RegExp, endPattern: string | RegExp, additionalLines = 0) {
  // Read the file
  const fileContent = await fsPromises.readFile(filePath, 'utf8');

  // Split content into lines
  const lines = fileContent.split('\n');

  // Create pattern matcher functions
  const matchesStartPattern = typeof startPattern === 'string'
    ? (line: string) => line.includes(startPattern)
    : (line: string) => startPattern.test(line);

  const matchesEndPattern = typeof endPattern === 'string'
    ? (line: string) => line.includes(endPattern)
    : (line: string) => endPattern.test(line);

  // Find start and end line numbers
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (startLine === -1 && matchesStartPattern(lines[i])) {
      startLine = i + 1; // Convert to 1-based indexing
    }

    if (startLine !== -1 && endLine === -1 && matchesEndPattern(lines[i])) {
      endLine = i + 1 + additionalLines; // Convert to 1-based indexing and add additional lines
      break;
    }
  }

  if (startLine === -1 || endLine === -1) {
    console.log('Pattern not found in the file.');
    return;
  }

  // Make sure endLine doesn't exceed file length
  endLine = Math.min(endLine, lines.length);

  // Create a new array excluding the specified range
  const newLines = lines.filter((_, index) => {
    const lineNumber = index + 1; // Convert to 1-based indexing
    return lineNumber < startLine || lineNumber > endLine;
  });

  // Join lines back together
  const newContent = newLines.join('\n');

  // Write the modified content back to the file
  fsPromises.writeFile(filePath, newContent);

  const linesRemoved = endLine - startLine + 1;
  console.log(`Removed ${linesRemoved} lines (${startLine}-${endLine}) from ${filePath}`);
}