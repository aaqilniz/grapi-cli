export type Patch = {
    [x: string]: {
        [x: string]: {
            searchString: string | RegExp;
            replacement: string;
            path: string;
            isRegex?: boolean;
            replaceAll?: true;
        };
    };
};
