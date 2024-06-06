import chalk from 'chalk';
import fs from 'fs';
import { exec } from 'child_process'

const execPromise = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

export async function execute(command: string, message?: string) {
  if (message) console.log(chalk.blue(message));
  return await execPromise(command);
}

// Recursive function to get files
export function getFiles(dir: string, files: string[] = []) {
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