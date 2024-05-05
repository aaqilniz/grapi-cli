export type Patch = {
    [x: string]: {
        [x: string]: {
            searchString: string,
            replacement: string,
            path: string
        }
    }
}