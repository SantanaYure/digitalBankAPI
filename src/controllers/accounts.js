const data = require('./data');

const createNewAccount = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    const db = await data.load();

    const contaExistente = db.contas.find(conta => conta.usuario.cpf === cpf || conta.usuario.email === email);
    if (contaExistente) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
    }

    const novaConta = {
        numero: (db.contas.length + 1).toString(),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    };

    db.contas.push(novaConta);
    await data.save(db);

    res.status(201).end();
}

const listAccounts = async (req, res) => {
  const { senha_banco } = req.query;

  if (!senha_banco) {
      return res.status(400).json({ mensagem: "A senha do banco não foi informada!" });
  }

  const db = await data.load();

  if (senha_banco !== db.banco.senha) {
      return res.status(400).json({ mensagem: "A senha do banco informada é inválida!" });
  }

  res.json(db.contas);
}

const deleteAccount = async (req, res) => {
  const numeroConta = req.params.numeroConta.toString();

  const db = await data.load();
  const { contas } = db;

  const conta = contas.find(conta => conta.numero === numeroConta);
  if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  const { saldo } = conta;
  if (saldo !== 0) {
      return res.status(400).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
  }

  const contaIndex = contas.indexOf(conta);
  contas.splice(contaIndex, 1);
  await data.save(db);

  res.status(204).end();
}

const updateAccountUser = async (req, res) => {
  const { numeroConta } = req.params;
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  const db = await data.load();
  const { contas } = db;

  const conta = contas.find(conta => conta.numero === numeroConta);
  if (!conta) {
      return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (cpf) {
    const cpfExistente = contas.find(conta => conta.usuario.cpf === cpf);
    if (cpfExistente && cpfExistente.numero !== numeroConta) {
        return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" });
    }
  }

  if (email) {
    const emailExistente = contas.find(conta => conta.usuario.email === email);
    if (emailExistente && emailExistente.numero !== numeroConta) {
        return res.status(400).json({ mensagem: "O e-mail informado já existe cadastrado!" });
    }
  }

  conta.usuario = { nome, cpf, data_nascimento, telefone, email, senha };
  await data.save(db);

  res.status(204).end();
}

module.exports = { 
  createNewAccount,
  listAccounts,
  deleteAccount, 
  updateAccountUser,
};
