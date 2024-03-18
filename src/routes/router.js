const express = require('express');
const router = express.Router();
const { 
  createNewAccount,
  listAccounts,
  deleteAccount,
  updateAccountUser,
} = require('../controllers/accounts');

const { 
  deposit, 
  withdrawal,
  transfer,
} = require('../controllers/transactions');

const { 
  getAccountBalance,
  getAccountStatement
} = require('../controllers/balance');

router.post('/contas', createNewAccount);
router.post('/transacoes/:numeroConta/depositar', deposit);
router.post('/transacoes/:numeroConta/sacar', withdrawal);
router.post('/transacoes/transferir', transfer);

router.get('/contas', listAccounts);
router.get('/contas/saldo', getAccountBalance);
router.get('/contas/extrato', getAccountStatement);

router.delete('/contas/:numeroConta', deleteAccount);

router.put('/contas/:numeroConta/usuario', updateAccountUser);

module.exports = router;
