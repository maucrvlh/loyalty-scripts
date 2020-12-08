
import { IBaseScript } from "./base/IBaseScript";
import commander, { Command } from 'commander'

export class Handler {
    private static instance: Handler
    private commandHandler: commander.Command
    
    private constructor(commandHandler: commander.Command) {
        this.commandHandler = commandHandler
        this.commandHandler.name('loyalty')
        this.commandHandler.version('1.0.0')
    }
    
    public getCommandHandler() {
        return this.commandHandler
    }

    static getInstance() {
        if (!Handler.instance)
            Handler.instance = new Handler(new Command())
        
        return Handler.instance
    }

    static registerScript(script: IBaseScript) {
        script
            .makeCommand(Handler
                .getInstance()
                .getCommandHandler())
    }
    
    static run() {
        Handler
            .getInstance()
            .getCommandHandler()
            .parse(process.argv)
    }
}