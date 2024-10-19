import { Command } from '@oclif/core';
export default class App extends Command {
    static description: string;
    static args: {
        name: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        name: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        description: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        outdir: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        eslint: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        prettier: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        mocha: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        loopbackBuild: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        vscode: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        docker: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        repositories: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        services: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        apiconnect: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        config: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        yes: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        help: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-cache": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-install": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "generate-configs": import("@oclif/core/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
