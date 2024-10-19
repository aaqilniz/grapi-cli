import { Command } from '@oclif/core';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
export default class Patch extends Command {
    async run() {
        const __filename = fileURLToPath(import.meta.url); // manually get __filename
        const __dirname = path.dirname(__filename); // manually get __dirname
        await fs.cp(path.join(__dirname, '../../patches'), './patches', { recursive: true });
        const pkgPath = './package.json';
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
        pkg.scripts['postinstall'] = 'patch-package';
        pkg.dependencies['loopback-connector-mysql'] = '7.0.10';
        pkg.dependencies['loopback-datasource-juggler'] = '5.0.12';
        // pkg.dependencies['@loopback/repository-json-schema'] = '8.0.7';
        // pkg.dependencies['@loopback/openapi-v3'] = '10.0.5';
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    }
}