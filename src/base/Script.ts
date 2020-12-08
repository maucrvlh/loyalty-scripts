import { IBaseCommand } from "./IBaseScript"

export abstract class Script {
    constructor(public command: string, public version: string, public description: string) {}
    getInfo() {
        console.log('-'.repeat(20))
        console.log('Script: ', this.command, 'v'.concat(this.version))
        console.log('Description: ', this.description)
    }
}