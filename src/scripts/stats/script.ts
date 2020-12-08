import * as admin from 'firebase-admin'
import * as path from 'path'

let firestore: FirebaseFirestore.Firestore = null

const START_DATE = new Date(2020, 10, 1)

const initFirebase = (credenciais: string) => {
    if (!admin.apps.length)
        admin.initializeApp({
            credential: admin.credential.cert(require(credenciais))
        })
    firestore = admin.firestore()
}

const queryCollection = async (credenciais: string, inicio?: Date, termino?: Date) => {
    initFirebase(credenciais)

    let collection = firestore
        .collection('redemptions')
    
    if (inicio)
        collection.where('redemptionDate', '>', inicio)
        
    if (termino)
        collection.where('redemptionDate', '<', termino)

    return await collection.get()
}

const listRedemptionsWithVoucher = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  let records = []
  docs.forEach(doc => {
    let d = doc.data()
    let date = new Date(d.createdAt).toLocaleString()
    records.push({
      'Data': date,
      'Transação': d.transaction.id,
      'CPF': d.userCpf.slice(0,7).concat('***'),
      'Status': d.status,
      'Cupom': d.voucherCode ? d.voucherCode.slice(0,4).concat('*') : 'Sem cupom',
      'Status cupom': d.voucherStatus,
      'Recompensa': d.reward.prize
    })
  })
  console.table(records)
}

const listBurnedRedemptions = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  docs.forEach(doc => {
    let d = doc.data()
    let date = new Date(d.redemptionDate.toDate()).toLocaleString()
    if (d.voucherStatus == 'BURNED')
      console.log(date, '\t ', d.transaction.id, '\t ', d.userCpf, '\t ', d.status, '\t ', d.voucherCode, '\t ', d.voucherStatus, '\t ', d.reward.prize)
  })
}

const listRedemptionsPrizeCarrefour = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  docs.forEach(doc => {
    let d = doc.data()
    let date = new Date(d.redemptionDate.toDate()).toLocaleString()
    if (d.status == 'APPROVED' && d.reward.prize.startsWith('carrefour'))
      console.log(date, '\t ', d.transaction.id, '\t ', d.userCpf, '\t ', d.status, '\t ', d.voucherCode, '\t ', d.voucherStatus, '\t ', d.reward.prize)
  })
}

const groupedByPrizeAndStatusTable = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', new Date(2020, 10, 3))
    .get()

  let groupedList = new Map()
  let allRecords = new Set()
  let allPrizes = new Set()
  let allStatus = ['CREATED', 'REQUESTED', 'REGISTERED', 'APPROVED', 'DISAPPROVED', 'NOT_SENT', 'WO_BALANCE']
  docs.forEach(doc => {
    let d = doc.data()
    let key = d.reward.prize+d.status
    allPrizes.add(d.reward.prize)
    allRecords.add(JSON.stringify({ prize: d.reward.prize, status: d.status }))
    groupedList.set(key, groupedList.get(key)+1 || 1)
  })
  let allRecordsParsed = [...allRecords].map((r: string) => JSON.parse(r))
  let result = []
  allPrizes.forEach(e => {
    let obj = { prize: e }
    allRecordsParsed.filter(r => r.prize === e).forEach(r => {
      allStatus.forEach(s => {
        Object.assign(obj, { [s]: (groupedList.get(r.prize+s)||0) })
      })
    })
    result.push(obj)
  })
  console.table(result)
}

const listUsersByPrize = async () => {
  let docs = await firestore
    .collection('redemptions')
    .orderBy('redemptionDate')
    .get()

  docs.forEach(doc => {
    let d = doc.data()
    let date = new Date(d.redemptionDate.toDate()).toLocaleString()
    let prizes = ['carrefour-ventilador-mondial',
      'carrefour-vale-compra-r60',
      'carrefour-frigideira-aco-inox',
      'carrefour-jbl-go',
      'carrefour-cortador-de-cabelo-mondial',
      'carrefour-fone-tws-i2go',
      'carrefour-headphone-bt-jbl',
      'carrefour-sanduicheira-mondial',
      'carrefour-secador-mondial',
      'carrefour-vale-compra-r75']
    if (d.status == 'APPROVED' && prizes.indexOf(d.reward.prize) > -1)
      console.log(date, '\t', d.transaction.id, '\t', d.userCpf, '\t', d.status, '\t', d.reward.prize)
  })
}

const groupedByPrizeAndStatus = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  let groupedList = new Map()
  let allRecords = new Set()
  let allPrizes = new Set()
  docs.forEach(doc => {
    let d = doc.data()
    let key = d.reward.prize+d.status
    allPrizes.add(d.reward.prize)
    allRecords.add(JSON.stringify({ prize: d.reward.prize, status: d.status }))
    groupedList.set(key, groupedList.get(key)+1 || 1)
  })
  let allRecordsParsed = [...allRecords].map((r: string) => JSON.parse(r))
  allPrizes.forEach(e => {
    console.log('\n\rPrize: ', e)
    allRecordsParsed.filter(r => r.prize === e).forEach(r => {
      console.log('\tStatus: ', r.status, ' \tQtd: ', groupedList.get(r.prize+r.status))
    })
  })
}

const groupedByPrize = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  let groupedList = new Map()
  docs.forEach(doc => {
    let d = doc.data()
    if (d.status == 'APPROVED') {
      groupedList.set(d.reward.prize, groupedList.get(d.reward.prize)+1 || 1)
    }
  })
  console.log(new Map(Array.from(groupedList).sort((a, b) => b[1] - a[1])))
}

const groupedByStatus = async () => {
  let docs = await firestore
    .collection('redemptions')
    .where('redemptionDate', '>', START_DATE)
    .get()

  let groupedList = new Map()
  docs.forEach(doc => {
    let d = doc.data()
    groupedList.set(d.status, groupedList.get(d.status)+1 || 1)
  })
  console.log(new Map(Array.from(groupedList).sort((a, b) => b[1] - a[1])))
}

export const approved = async (credenciaisOrig: string, inicio?: string, termino?: string) => {
  let credenciais = path.join(process.cwd(), credenciaisOrig)
  let dinicio = new Date(inicio)
  let dtermino = new Date(termino)
  if ((inicio && isNaN(dinicio.getDate())) || (termino && isNaN(dtermino.getDate()))) {
      throw new Error('A data está no formato inválido')
  }
  let docs = await queryCollection(credenciais, dinicio, dtermino)

  docs.forEach(doc => {
      let d = doc.data()
      let date = new Date(d.redemptionDate.toDate()).toLocaleString()
      if (d.status == 'APPROVED')
      console.log(date, ' - ', d.transaction.id, ' - ', d.userCpf, ' - ', d.status, ' - ', d.reward.prize)
  })
}

export const complete = async (credenciaisOrig: string, inicio?: string, termino?: string) => {
  let credenciais = path.join(process.cwd(), credenciaisOrig)
  let dinicio = new Date(inicio)
  let dtermino = new Date(termino)
  if ((inicio && isNaN(dinicio.getDate())) || (termino && isNaN(dtermino.getDate()))) {
      throw new Error('A data está no formato inválido')
  }
  let docs = await queryCollection(credenciais, dinicio, dtermino)

  let groupedListByPrize = new Map()
  let groupedListByStatus = new Map()
  let groupedListByKey = new Map()
  let allRecords = new Set()
  let allPrizes = new Set()
  docs.forEach(doc => {
    let d = doc.data()
    if ((termino && d.redemptionDate.toDate() <= dtermino) || !termino) {
      let key = d.reward.prize+d.status
      allPrizes.add(d.reward.prize)
      allRecords.add(JSON.stringify({ prize: d.reward.prize, status: d.status }))
      groupedListByStatus.set(d.status, groupedListByStatus.get(d.status)+1 || 1)
      groupedListByKey.set(key, groupedListByKey.get(key)+1 || 1)
      if (d.status == 'APPROVED') {
        groupedListByPrize.set(d.reward.prize, groupedListByPrize.get(d.reward.prize)+1 || 1)
      }
    }
  })
  let allRecordsParsed = [...allRecords].map((r: string) => JSON.parse(r))
  console.log('\r\n===========================================')
  console.log('\r\nDesde:\t ', dinicio.toUTCString())
  termino && console.log('\r\nAté:\t ', dtermino.toUTCString())
  console.log('\r\nProj:\t ', 'br-apps-mobile-prd')
  console.log('\r\nDocs:\t ', docs.size)
  console.log('\r\n===========================================')
  console.log('\r\nQuantidade por prizename e status\r\n')
  allPrizes.forEach(e => {
    console.log('\r\nPrize: ', e)
    allRecordsParsed.filter(r => r.prize === e).forEach(r => {
      console.log('\tStatus: ', r.status, ' \tQtd: ', groupedListByKey.get(r.prize+r.status))
    })
  })

  console.log('\r\n===========================================')
  console.log('\r\nQuantidade por status\r\n\r\n')
  console.log(new Map(Array.from(groupedListByStatus).sort((a, b) => b[1] - a[1])))

  console.log('\r\n===========================================')
  console.log('\r\nResgates APROVADOS por prizename\r\n\r\n')
  console.log(new Map(Array.from(groupedListByPrize).sort((a, b) => b[1] - a[1])))
}

const listApprovedRedemptionsByPrizename = async (prizename) => {
  let docs = await firestore
    .collection('redemptions')
    .where('reward.prize', '==', prizename)
    .get()

  console.log('\r\n===========================================')
  console.log('\r\nRelatório de resgates por prizename')
  console.log('\r\nPrize:\t ', prizename)
  console.log('\r\nProj:\t ', 'br-apps-mobile-prd')
  console.log('\r\nDocs:\t ', docs.size)
  console.log('\r\n===========================================')

  let records = []
  docs.forEach(doc => {
    let d = doc.data()
    if (d.status == 'APPROVED')
      records.push({ 
        'CPF': d.userCpf,
        seconds: d.history.filter(e => e.status === 'APPROVED')[0].date,
        'Data de aprovação': new Date(d.history.filter(e => e.status === 'APPROVED')[0].date.toDate()).toLocaleString(),
        'Data limite p/ uso': new Date(d.expirationDate.toDate()).toLocaleString(),
        'Cupom': d.voucherCode || 'Vazio'
      })
  })
  records.sort((a, b) => a.seconds - b.seconds)

  console.table(records.map(e => { 
    delete e.seconds
    return e
  }))
}
