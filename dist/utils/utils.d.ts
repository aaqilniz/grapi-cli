import { MethodDeclaration, ParameterDeclaration, SourceFile } from 'ts-morph';
import { Patch } from '../types/patch.types.js';
export type ExecutionResponse = {
    error: any;
    stdout: string;
    stderr: string;
};
export declare function execute(command: string, message?: string): Promise<ExecutionResponse>;
export declare function applyPatches(patches: Patch): void;
export declare function getNpmGlobalDir(): Promise<string>;
export declare function getFiles(dir: string, files?: string[]): string[];
export declare function isJson(item: string): boolean;
export declare function toKebabCase(str: string): string;
export declare function toPascalCase(str: string): string;
export declare function toCamelCase(str: string): string;
export declare function addDecoratorToMethod(addDecoratorTo: MethodDeclaration, name: string, decoratorArguments: string[]): void;
export declare function addDecoratorToParameter(addDecoratorTo: ParameterDeclaration, name: string, decoratorArguments: string[]): void;
export declare function addImport(addImportTo: SourceFile | undefined, defaultImport: string, moduleSpecifier: string, replace?: boolean): void;
export declare function isLoopBackApp(packageJson: any): boolean;
export declare function prompt(command: string, flags: any, args?: any): void;