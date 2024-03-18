const data = require('./data');

const deposit = async (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
      return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" });
  }

  if (valor <= 0) {
      return res.status(400).json({ mensagem: "O valor do depósito deve ser maior que zero!" });
  }

  const db = await data.load();
  const { contas } = db;

  const conta = contas.find(conta => conta.numero === numero_conta);
  if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  conta.saldo += valor;
  db.depositos.push({ data: new Date().toISOString(), numero_conta, valor });
  await data.save(db);

  res.status(204).end();
}

const withdrawal = async (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || !valor || !senha) {
      return res.status(400).json({ mensagem: "O número da conta, o valor do saque e a senha são obrigatórios!" });
  }

  const db = await data.load();
  const { contas } = db;

  const conta = contas.find(conta => conta.numero === numero_conta);
  if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (valor <= 0) {
      return res.status(400).json({ mensagem: "O valor do saque deve ser maior que zero!" });
  }

  if (valor > conta.saldo) {
      return res.status(400).json({ mensagem: "Saldo insuficiente para o saque!" });
  }

  if (senha !== conta.usuario.senha) {
      return res.status(401).json({ mensagem: "Senha incorreta!" });
  }

  conta.saldo -= valor;
  db.saques.push({ data: new Date().toISOString(), numero_conta, valor });
  await data.save(db);

  res.status(204).end();
}

const transfer = async (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
      return res.status(400).json({ mensagem: "O número da conta de origem, o número da conta de destino, o valor da transferência e a senha são obrigatórios!" });
  }

  const db = await data.load();
  const { contas } = db;

  const contaOrigem = contas.find(conta => conta.numero === numero_conta_origem);
  const contaDestino = contas.find(conta => conta.numero === numero_conta_destino);

  if (!contaOrigem || !contaDestino) {
      return res.status(404).json({ mensagem: "Conta de origem ou conta de destino não encontrada!" });
  }

  if (valor <= 0) {
      return res.status(400).json({ mensagem: "O valor da transferência deve ser maior que zero!" });
  }

  if (valor > contaOrigem.saldo) {
      return res.status(400).json({ mensagem: "Saldo insuficiente para a transferência!" });
  }

  if (senha !== contaOrigem.usuario.senha) {
      return res.status(401).json({ mensagem: "Senha incorreta!" });
  }

  contaOrigem.saldo -= valor;
  contaDestino.saldo += valor;
  db.transferencias.push({ data: new Date().toISOString(), numero_conta_origem, numero_conta_destino, valor });
  await data.save(db);

  res.status(204).end();
}

const getAccountBalance = async (req, res) => {
  try {
      const { numero_conta, senha } = req.query;

      if (!numero_conta || !senha) {
          return res.status(400).json({ mensagem: "O número da conta e a senha são obrigatórios!" });
      }

      const db = await data.load();
      const { contas } = db;

      const conta = contas.find((c) => c.numero === numero_conta);
      if (!conta) {
          return res.status(404).json({ mensagem: "Conta não encontrada!" });
      }

      if (conta.usuario.senha !== senha) {
          return res.status(401).json({ mensagem: "Senha inválida." });
      }

      return res.status(200).json({ saldo: conta.saldo });
  } catch (error) {
      console.error("Erro ao consultar saldo:", error);
      return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

module.exports = { deposit, withdrawal, transfer, getAccountBalance };
