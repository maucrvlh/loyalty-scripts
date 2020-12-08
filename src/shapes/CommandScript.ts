import { Command } from "commander";
import { IBaseCommand, IBaseScript, IBaseScriptActionOptions } from "../base/IBaseScript";
import { Script } from "../base/Script";

export class CommandScript extends Script implements IBaseScript {
    private arguments: string
    private action: (...args: any) => any
    private options?: {
        param: string,
        description: string,
        default?: string
    }[]

    constructor(
        public command: string,
        public version: string,
        public description: string    
    ) {
        super(command, version, description)
        return this
    }

    setArguments(args: string) {
        this.arguments = args
        return this
    }

    setOptions(options: IBaseScriptActionOptions[]) {
        this.options = options
        return this
    }

    setAction(action: any) {
        this.action = action
        return this
    }

    makeCommand(program: IBaseCommand) {
        let command = new Command(this.command)

        this.arguments && command.arguments(this.arguments)
        
        Array.isArray(this.options) && 
            this.options.length > 0 &&
            this.options.forEach(opt => command.option(opt.param, opt.description, opt.default))
        
        command.description(this.description)
        command.action(this.action)
        
        program.addCommand(command)
    }
}