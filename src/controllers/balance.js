const data = require('./data');

const getAccountBalance = async (req, res) => {
  const { numero_conta } = req.query;

  try {
    const db = await data.load();  
    const { contas } = db;       

    const conta = contas.find(conta => conta.numero === numero_conta);     

    if (!conta) {
      return res.status(404).json({ mensagem: "Conta bancária não encontrada!" });
    }

    return res.status(200).json({ saldo: conta.saldo });
  } catch (error) {
    console.error("Erro ao consultar saldo:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
};

const getAccountStatement = async (req, res) => {
    try {
        const { numero_conta, senha } = req.query;

        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "O número da conta e a senha são obrigatórios!" });
        }

        const db = await data.load();
        const { contas, depositos, saques, transferencias } = db;

        const conta = contas.find(conta => conta.numero === numero_conta);

        if (!conta) {
            return res.status(404).json({ mensagem: "Conta bancária não encontrada!" });
        }

        if (conta.usuario.senha !== senha) {
            return res.status(401).json({ mensagem: "Senha inválida." });
        }

        const extrato = {
            depositos: depositos.filter(deposito => deposito.numero_conta === numero_conta),
            saques: saques.filter(saques => saques.numero_conta === numero_conta),
            transferenciasEnviadas: transferencias.filter(transferencia => transferencia.numero_conta_origem === numero_conta),
            transferenciasRecebidas: transferencias.filter(transferencia => transferencia.numero_conta_destino === numero_conta)
        };

        return res.status(200).json(extrato);
    } catch (error) {
        console.error("Erro ao obter extrato da conta:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = { getAccountBalance, getAccountStatement };
