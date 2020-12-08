import commander from "commander";

export interface IBaseScriptActionOptions {
    param: string,
    description: string,
    default?: string
}[]

export interface IBaseScript {
    command: string
    version: string
    description: string
    setArguments: (args: string) => void
    setAction: (...args: any) => any
    setOptions: (params: IBaseScriptActionOptions[]) => void
    makeCommand(program: IBaseCommand): any
}

export interface IBaseCommand extends commander.Command {}