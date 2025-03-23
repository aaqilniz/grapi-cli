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
  security: string[];
  userNameLogin: string[];
  virtualAsGenerated: string[];
  supportRestrictedProperties: string[];
  referencesManyFilters: string[];
  customKeyHasMany: string[];
  buildQueryUniqueKeys: string[];
  setDefaultIdType: string[];
  enableCacheForRestCrud: string[];
  filtersInCount: string[];
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
      security: [
        '@loopback+rest-crud+*+005+security.patch'
      ],
      userNameLogin: ['@loopback+authentication-jwt+*+001+auth.patch'],
      supportRestrictedProperties: [
        '@loopback+authorization+*+001+restricted-properties.patch',
      ],
      virtualAsGenerated: [],
      referencesManyFilters: ['@loopback+rest-crud+*+002+refmany-filters.patch'],
      customKeyHasMany: ['@loopback+repository+*+003+custom-key-has-many.patch'],
      buildQueryUniqueKeys: [],
      setDefaultIdType: ['loopback-datasource-juggler+*+002+set-use-default-id-type.patch'],
      enableCacheForRestCrud: ['@loopback+rest-crud+*+003+apply-caching.patch'],
      filtersInCount: ['@loopback+rest-crud+*+004+filters-in-count.patch']
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

    let groupByPatchesExists = false;
    const invokedFrom = process.cwd();
    const patchDir = `${invokedFrom}/patches`;
    if (existsSync(patchDir)) {
      const existingPatches = readdirSync(patchDir);
      existingPatches.forEach(existingPatch => {
        if (existingPatch.includes('groupby')) { groupByPatchesExists = true; }
      });
    }

    //default patches if no openapi patches are to be applied
    if (patches && !patches.includes('openapi')) {
      if (!patches.includes('openAPISpecsExtensions')) patches.push('openAPISpecsExtensions');
      if (!patches.includes('hiddenProperties')) patches.push('hiddenProperties');
      if (!patches.includes('virtualAsGenerated')) patches.push('virtualAsGenerated');
      if (!patches.includes('setDefaultIdType')) patches.push('setDefaultIdType');
      if (!patches.includes('referencesManyFilters')) patches.push('referencesManyFilters');
      if (!patches.includes('enableCacheForRestCrud')) patches.push('enableCacheForRestCrud');
      if (!patches.includes('security')) patches.push('security');
      if (!patches.includes('filtersInCount')) patches.push('filtersInCount');
      if (patches.includes('groupBy') || groupByPatchesExists) {
        PatchPaths['referencesManyFilters'].push('loopback-connector+*+002+refmany-filters.patch');
      } else {
        PatchPaths['referencesManyFilters'].push('loopback-connector+*+001+refmany-filters.patch');
      }
    }

    if (
      patches &&
      (patches.includes('auth') || patches.includes('authorization'))
    ) {
      patches.push('userNameLogin');
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
