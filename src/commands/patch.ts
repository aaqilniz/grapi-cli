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
    const patches = options.patches || [];
    const PatchPaths = {
      openapi: ['loopback-connector-openapi+*-construct-absolute-url.patch'],
      openAPISpecsExtensions: [
        '@loopback+repository-json-schema+*-oas-extensions.patch',
        '@loopback+openapi-v3+*-oas-extensions.patch',
        'loopback-connector-mysql+*+001+index-info.patch',
        'loopback-datasource-juggler+*-index-info.patch',
        '@loopback+rest+*+001+oas-extensions.patch'
      ],
      hiddenProperties: [
        '@loopback+repository-json-schema+*+001+hidden-properties.patch',
        '@loopback+repository+*-hidden-properties.patch',
        '@loopback+rest-crud+*+001+hidden-properties.patch',
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
        '@loopback+rest-crud+*+002+auth.patch',
        '@loopback+authentication-jwt+*-auth.patch'
      ],
      virtualAsGenerated: [
        'loopback-connector-mysql+*+002+virtual-as-generated.patch',
      ],
      supportRestrictedProperties: [
        '@loopback+authorization+*+001+restricted-properties.patch',
      ],
      authorization: [
        '@loopback+rest-crud+*+003+authorization.patch',
      ]
    };
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const patchDirectoryPath = path.join(__dirname, '../../patches');

    const patchesToCopy: string[] = [];

    //default patches if no openapi patches are to be applied
    if (patches && !patches.includes('openapi')) {
      if (!patches.includes('openAPISpecsExtensions')) patches.push('openAPISpecsExtensions');
      if (!patches.includes('hiddenProperties')) patches.push('hiddenProperties');
      if (!patches.includes('virtualAsGenerated')) patches.push('virtualAsGenerated');
    }
    if (patches && patches.includes('openapi')) {
      PatchPaths.openapi.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('openAPISpecsExtensions')) {
      PatchPaths.openAPISpecsExtensions.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('hiddenProperties')) {
      PatchPaths.hiddenProperties.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches &&
      patches.includes('groupBy') &&
      !patches.includes('openapi')
    ) {
      PatchPaths.groupBy.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('auditLogs')) {
      PatchPaths.auditLogs.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('auth')) {
      PatchPaths.auth.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('virtualAsGenerated')) {
      PatchPaths.virtualAsGenerated.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }
    if (patches && patches.includes('authorization')) {
      PatchPaths.authorization.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
      PatchPaths.supportRestrictedProperties.forEach(patch => {
        const patchFileName = findVersionedFile(patch, patchDirectoryPath);
        patchesToCopy.push(patchFileName);
      });
    }

    copyFiles(patchDirectoryPath, './patches', patchesToCopy);

    const pkgPath = './package.json';
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));

    if (patches && (patches.includes('hiddenProperties') || patches.includes('auth'))) {
      pkg.dependencies['@loopback/rest-crud'] = '0.18.8';
      await execute('npm install @loopback/rest-crud@0.18.8');
    }

    if (patches && (patches.includes('openAPISpecsExtensions') || patches.includes('virtualAsGenerated'))) {
      pkg.dependencies['loopback-connector-mysql'] = '7.0.15';
      pkg.dependencies['loopback-datasource-juggler'] = '5.1.2';
      await execute('npm install loopback-connector-mysql@7.0.15 loopback-datasource-juggler@5.1.2');
    }
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
    await execute('npx patch-package');
  }
}
