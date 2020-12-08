import { Command } from "commander";
import { CommandScript } from "../../shapes/CommandScript";
import { complete, approved } from "./script";

export const Stats = new CommandScript('relatorio', '1.0.0', 'obtém e tabula números de resgates direto do Firestore; modelos disponíveis: completo, aprovados')
    .setArguments('<modelo>')
    .setOptions([
        {
            param: '-c, --credenciais <credenciais>',
            description: 'identificação da recompensa, quando modelo é "aprovados"'
        },
        {
            param: '-p, --prize <prize>',
            description: 'identificação da recompensa, quando modelo é "aprovados"'
        },
        {
            param: '-i, --inicio <inicio>',
            description: 'data de inicio no formato aaaa-mm-ddThh:mm:ss, exemplo: 2020-11-26T00:36:30'
        },
        {
            param: '-t, --termino <termino>',
            description: 'data de término no formato aaaa-mm-ddThh:mm:ss, exemplo: 2020-11-26T00:36:30'
        },
        {
            param: '-s, --saida <arquivo>',
            description: 'salva a extração no arquivo especificado'
        }
    ])
    .setAction((modelo: string, cmd: Command) => {
        switch(modelo) {
            case 'completo':
                complete(cmd.credenciais, cmd.inicio, cmd.termino)
                break;
            case 'aprovados':
                approved(cmd.credenciais, cmd.inicio, cmd.termino)
                break;
            default:
                complete(cmd.credenciais, cmd.inicio, cmd.termino)
                break;
        }
    })