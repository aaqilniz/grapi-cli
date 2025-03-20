import { Command, Flags } from '@oclif/core';
import { existsSync, promises as fs, readdirSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { processOptions, standardFlags, findVersionedFile, copyFiles, execute } from '../utils/index.js';

interface PatchPathsType {
  openapi: string[];
  openAPISpecsExtensions: string[];
  hiddenProperties: string[];
  groupBy: string[];
  auditLogs: string[];
  auth: string[];
  virtualAsGenerated: string[];
  supportRestrictedProperties: string[];
  authorization: string[];
  referencesManyFilters: string[];
  customKeyHasMany: string[];
  buildQueryUniqueKeys: string[];
  setDefaultIdType: string[];
  enableCacheForRestCrud: string[];
}

export default class Patch extends Command {

  static override flags = {
    config: standardFlags.config,
    patches: Flags.string({ description: 'An stringified array of patches.' }),
  }
  public async run(): Promise<void> {
    const parsed = await this.parse(Patch);

    let options = processOptions(parsed.flags);
    const patches = options.patches || [];
    const PatchPaths: PatchPathsType = {
      openapi: ['loopback-connector-openapi+*+001+construct-absolute-url.patch'],
      openAPISpecsExtensions: [
        '@loopback+repository-json-schema+*+001+oas-extensions.patch',
        '@loopback+openapi-v3+*+001+oas-extensions.patch',
        'loopback-datasource-juggler+*+001+index-info.patch',
        '@loopback+rest+*+001+oas-extensions.patch'
      ],
      hiddenProperties: [
        '@loopback+rest-crud+*+001+hidden-properties.patch',
        '@loopback+repository-json-schema+*+002+hidden-properties.patch',
        '@loopback+repository+*+002+hidden-properties.patch',
      ],
      groupBy: [
        '@loopback+repository+*+001+groupby.patch',
        'loopback-connector+*+001+groupby.patch',
        '@loopback+repository-json-schema+*+003+groupby.patch',
        'loopback-datasource-juggler+*+003+groupby.patch'
      ],
      auditLogs: [
        '@sourceloop+audit-log+*+001+auditlogs.patch'
      ],
      auth: [
        '@loopback+rest-crud+*+002+auth.patch',
        '@loopback+authentication-jwt+*+001+auth.patch'
      ],
      virtualAsGenerated: [],
      supportRestrictedProperties: [
        '@loopback+authorization+*+001+restricted-properties.patch',
      ],
      authorization: [
        '@loopback+rest-crud+*+003+authorization.patch',
      ],
      referencesManyFilters: ['@loopback+rest-crud+*+002+refmany-filters.patch'],
      customKeyHasMany: ['@loopback+repository+*+003+custom-key-has-many.patch'],
      buildQueryUniqueKeys: [],
      setDefaultIdType: ['loopback-datasource-juggler+*+002+set-use-default-id-type.patch'],
      enableCacheForRestCrud: ['@loopback+rest-crud+*+003+apply-caching.patch'],
    };
    const pkgPath = './package.json';
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    let mysqlConnectorInstalled = false;
    let postgresConnectorInstalled = false;
    if (pkg['dependencies']['loopback-connector-postgresql']) {
      postgresConnectorInstalled = true;
    }
    if (pkg['dependencies']['loopback-connector-mysql']) {
      mysqlConnectorInstalled = true;
    }

    if (options.connector === 'mysql' || mysqlConnectorInstalled) {
      PatchPaths.openAPISpecsExtensions.push('loopback-connector-mysql+*+001+index-info.patch');
      PatchPaths.virtualAsGenerated.push('loopback-connector-mysql+*+002+virtual-as-generated.patch');
    }
    if (options.connector === 'postgresql' || postgresConnectorInstalled) {
      PatchPaths.buildQueryUniqueKeys.push('loopback-connector-postgresql+*+001+build-query-unique-keys.patch');
    }
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const patchDirectoryPath = path.join(__dirname, '../../patches');
    const patchesToCopy: string[] = [];

    //default patches if no openapi patches are to be applied
    if (patches && !patches.includes('openapi')) {
      if (!patches.includes('openAPISpecsExtensions')) patches.push('openAPISpecsExtensions');
      if (!patches.includes('hiddenProperties')) patches.push('hiddenProperties');
      if (!patches.includes('virtualAsGenerated')) patches.push('virtualAsGenerated');
      if (!patches.includes('setDefaultIdType')) patches.push('setDefaultIdType');
      if (!patches.includes('referencesManyFilters')) patches.push('referencesManyFilters');
      if (!patches.includes('enableCacheForRestCrud')) patches.push('enableCacheForRestCrud');
    }

    if (
      patches &&
      patches.includes('auth') &&
      !patches.includes('authorization')
    ) {
      patches.push('authorization');
    }
    if (
      patches &&
      patches.includes('authorization') &&
      !patches.includes('auth')
    ) {
      patches.push('auth');
    }
    if (patches.includes('authorization')) {
      patches.push('supportRestrictedProperties');
    }
    const patchesList = Object.keys(PatchPaths);

    for (let index = 0; index < patchesList.length; index++) {
      const patchName = patchesList[index];
      console.log(patchName, patches && patches.includes(patchName));
      if (patches && patches.includes(patchName)) {
        //groupBy patch is only applied for non-openapi based apps
        if (patchName === 'groupBy' && patches.includes('openapi')) break;
        (PatchPaths as any)[patchName].forEach((patch: string) => {
          const patchFileName = findVersionedFile(patch, patchDirectoryPath);
          patchesToCopy.push(patchFileName);
        });
      }
    }
    copyFiles(patchDirectoryPath, './patches', patchesToCopy);

    await execute('npx patch-package');
  }
}
