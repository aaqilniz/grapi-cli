console.log('patching loopback 4 cli...');
import { exec } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs';
import patches from './patches.js';

type ExecutionResponse = {
    error: any,
    stdout: string,
    stderr: string,
};

const execPromise = (command: string): Promise<ExecutionResponse> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}

export async function execute(command: string, message?: string): Promise<ExecutionResponse> {
    if (message) console.log(message);
    return await execPromise(command);
}

(async () => {
    const response: ExecutionResponse = await execute(`npm list -g`);
    if (response.stdout) {
        const lines = response.stdout.split('\n');
        const subdirectory = lines[0].trim();
        const cliPath = `${subdirectory}/node_modules/@loopback/cli`;
        try {
            if (!existsSync(cliPath)) throw new Error('Loopback\'s CLI is not installed.');
            Object.keys((patches)).forEach(patchKey => {
                const patch = patches[patchKey];
                Object.keys(patch).forEach(subPatchKey => {
                    const { path, replacement, searchString } = patch[subPatchKey];
                    const filePath = `${cliPath}${path}`;
                    const data = readFileSync(filePath, 'utf8');
                    if (data) {
                        const updatedContent = data.replace(searchString, replacement);
                        if (!updatedContent) throw new Error('failed to update the content.');
                        writeFileSync(filePath, updatedContent, 'utf8');
                        console.log('file updated successfully.');
                    } else {
                        throw new Error('no content found.');
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }
})();