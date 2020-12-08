import * as admin from 'firebase-admin';
import * as csv  from 'csvtojson'

export const updateCoupons = (credentials, originFile, batchLimit = 499) => {
    let firestore: admin.firestore.Firestore

    let batchArray: Array<admin.firestore.WriteBatch> = []
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