import { Command } from '@oclif/core';
export default class Openapi extends Command {
    static description: string;
    static args: {
        url: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        url: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        validate: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "promote-anonymous-schemas": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        client: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        datasource: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        redisDS: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        cache: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        positional: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        config: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        yes: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        help: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-cache": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "skip-install": import("@oclif/core/interfaces").BooleanFlag<boolean>;
        "generate-configs": import("@oclif/core/interfaces").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
