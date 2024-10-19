import { Command } from '@oclif/core';
export default class ImportLb3Models extends Command {
    static description: string;
    static args: {
        lb3app: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        outDir: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
        config: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        yes: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        help: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-cache": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-install": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "generate-configs": import("@oclif/core/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}