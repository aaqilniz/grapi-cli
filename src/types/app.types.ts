export type AppGeneratorFlags = {
    config: string,
    name: string,
    description: string,
    outdir: string,
    eslint: string,
    prettier: string,
    mocha: string,
    loopbackBuild: string,
    vscode: string,
    docker: string,
    [x: string]: string | boolean
}