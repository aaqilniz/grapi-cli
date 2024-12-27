import { Command, Flags } from '@oclif/core';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { processOptions, standardFlags, findVersionedFile, copyFiles, execute } from '../utils/index.js';

export default class Patch extends Command {

  static override flags = {
    config: standardFlags.config,
    patches: Flags.string({ description: 'An stringified array of patches.' }),
  }
  public async run(): Promise<void> {
    const parsed = await this.parse(Patch);

    let options = processOptions(parsed.flags);
    const { patches } = options;
    const PatchPaths = {
      openapi: ['loopback-connector-openapi+*-construct-absolute-url.patch'],
      openAPISpecsExtensions: [
        '@loopback+repository-json-schema+*-oas-extensions.patch',
        '@loopback+openapi-v3+*-oas-extensions.patch',
        'loopback-connector-mysql+*-index-info.patch',
        'loopback-datasource-juggler+*-index-info.patch',
      ],
      hiddenProperties: [
        '@loopback+repository-json-schema+*+001+hidden-properties.patch',
        '@loopback+repository+*-hidden-properties.patch',
        '@loopback+rest-crud+*-hidden-properties.patch',
      ],
      groupBy: [
        '@loopback+repository-json-schema+*+002+groupby.patch',
        '@loopback+repository+*-groupby.patch',
        'loopback-connector+*-groupby.patch',
        'loopback-datasource-juggler+*-groupby.patch'
      ],
      auditLogs: [
        '@sourceloop+audit-log+*-auditlogs.patch'
      ],
      auth: [
        '@loopback+rest-crud+*-auth.patch',
        '@loopback+authentication-jwt+*-auth.patch'
      ],
      virtualAsGenerated: [
        'loopback-connector-mysql+*-virtual-as-generated.patch',
      ]
    };
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const patchDirectoryPath = path.join(__dirname, '../../patches');

    const patchesToCopy: string[] = [];
    if (patches && !patches.includes('openapi')) {
      if (!patches.includes('openAPISpecsExtensions')) patches.push('openAPISpecsExtensions');
      if (!patches.includes('hiddenProperties')) patches.push('hiddenProperties');
    }
    if (patches && patches.includes('openapi')) {
      PatchPaths.openapi.forEach(openapi => {
        const patchFileName = findVersionedFile(openapi, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('openAPISpecsExtensions')) {
      PatchPaths.openAPISpecsExtensions.forEach(extensions => {
        const patchFileName = findVersionedFile(extensions, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('hiddenProperties')) {
      PatchPaths.hiddenProperties.forEach(hiddenProperty => {
        const patchFileName = findVersionedFile(hiddenProperty, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches &&
      patches.includes('groupBy') &&
      !patches.includes('openapi')
    ) {
      PatchPaths.groupBy.forEach(groupBy => {
        const patchFileName = findVersionedFile(groupBy, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('auditLogs')) {
      PatchPaths.auditLogs.forEach(auditLogs => {
        const patchFileName = findVersionedFile(auditLogs, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('auth')) {
      PatchPaths.auth.forEach(auth => {
        const patchFileName = findVersionedFile(auth, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('virtualAsGenerated')) {
      PatchPaths.virtualAsGenerated.forEach(virtualAsGenerated => {
        const patchFileName = findVersionedFile(virtualAsGenerated, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }

    copyFiles(patchDirectoryPath, './patches', patchesToCopy);

    const pkgPath = './package.json';
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    if (patches.hiddenProperties || patches.auth) {
      pkg.dependencies['@loopback/rest-crud'] = '0.18.8';
    }

    if (patches.openAPISpecsExtensions || patches.virtualAsGenerated) {
      pkg.dependencies['loopback-connector-mysql'] = '7.0.15';
      pkg.dependencies['loopback-datasource-juggler'] = '5.1.2';
    }
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    await execute('npx patch-package');
  }
}
