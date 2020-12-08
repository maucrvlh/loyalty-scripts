import { Command } from "commander";
import { CommandScript } from "../../shapes/CommandScript";
import { updateCoupons } from "./script";

export const Updater = new CommandScript(
        'update-coupons',
        '1.0.0',
        'lê um arquivo CSV, extrai o cupom de resgate e atualiza-o no Firestore')
    .setArguments('<credentials> <file>')
    .setOptions([{
        param: '-b, --batch',
        description: 'configura o limite de posições no lote'
    }])
    .setAction((credentials: string, file: string, cmd: Command) => {
        if (credentials && file)
            updateCoupons(credentials, file, cmd.batch)
        else
            throw new Error('É necessário informar as credenciais e o arquivo CSV original contendo os registros a serem atualizados.')
    })