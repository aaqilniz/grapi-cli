import chalk from 'chalk';
import fs from 'fs';
import { exec } from 'child_process';
import { MethodDeclaration, ParameterDeclaration, SourceFile } from 'ts-morph';

const execPromise = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

export async function execute(command: string, message?: string) {
  if (message) console.log(chalk.blue(message));
  return execPromise(command);
}

// Recursive function to get files
export function getFiles(dir: string, files: string[] = []) {
  if (!fs.existsSync(dir)) return [];
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
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