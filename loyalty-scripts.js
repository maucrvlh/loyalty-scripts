const admin = require('firebase-admin');
const csv = require("csvtojson")
const { program } = require('commander')

const updateCoupons = (credentials, originFile, batchLimit = 499) => {
    let firestore

    let batchArray = []
    let operationCounter = 0
    let batchIndex = 0
    
    const GCP_BATCH_LIMIT = batchLimit

    const parse = async (credentials, originFile) => {
        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        })
        
        firestore = admin.firestore()
        return csv({ noheader: false, delimiter: ';', trim: true, checkType: true, checkColumn: false, ignoreEmpty: true })
            .fromFile(originFile)
            .then(parsed => {
                batchArray.push(admin.firestore().batch());
                return Promise.resolve(parsed)
            })
            .then(parsed => updateRedemptions(parsed))
            .then(_ => {
                console.log('Fazendo commit das atualizações...')  
                batchArray.forEach(async batch => await batch.commit());
                console.log('Finalizado.')
            })
    }

    const updateRedemptions = async (redemptions = []) =>
        Promise.all(redemptions.map(redeem => applyUpdateFirestore(redeem)))

    const applyUpdateFirestore = async data => {
        let doc = await firestore
            .collection('redemptions')
            .where('transaction.refCode', '==', data.refCode)
            .get()
        
        if (doc.docs.length > 0) {
            console.log('#'+operationCounter,'/ lote #'+batchIndex,'/ refCode:',data.refCode)
            doc.forEach(async d => {
                let docRef = firestore
                    .collection('redemptions')
                    .doc(d.id)

                batchArray[batchIndex].update(docRef, { voucherCode: data.coupon });
                operationCounter++;

                if (operationCounter == (+GCP_BATCH_LIMIT)) {
                    console.log('(!) Limite de '+(+GCP_BATCH_LIMIT)+' posições do lote #'+batchIndex,'atingindo. Criando novo lote: #'+(batchIndex+1),'\r\n')
                    batchArray.push(admin.firestore().batch());
                    batchIndex++;
                    operationCounter = 0;
                }
            })
        } else {
            console.log('[!] Nenhum resgate encontrado com o refCode:',data.refCode)
        }
    }
    parse(credentials, originFile)
}

!(_ => {
    program
        .name('loyalty-scripts')
        .version('0.0.1')
    
    program
        .command('update-coupons <credentials> <file>')
        .option('-b, --batch <limit>', 'configura o limite de posições no lote.')
        .description('lê um arquivo CSV, extrai o cupom de resgate e atualiza-o no Firestore.\r\n\r\nexemplo: update-coupons credentials.json file.csv')
        .action(function (credentials, file, cmd) {
            console.log('Starting update-coupons\r\n')
            console.log('file:', file);
            console.log('credentials:', credentials);
            if (credentials && file)
                updateCoupons(credentials, file, cmd.batch)
        })

    // program
    //     .command('ping <credentials>')
    //     .description('verifica se o script consegue conectar à ao Firebase usando a conta de serviço especificada.')
    //     .action(function (cmd) {
    //         console.log('credentials:', cmd.credentials);
    //     })

    program.parse(process.argv);
})()