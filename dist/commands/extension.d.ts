import { Command } from '@oclif/core';
export default class Extension extends Command {
    static description: string;
    static args: {
        name: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        description: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        outDir: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        eslint: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        prettier: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        mocha: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        loopbackBuild: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        vscode: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        config: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        yes: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        help: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-cache": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-install": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "generate-configs": import("@oclif/core/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
