import chalk from 'chalk';
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