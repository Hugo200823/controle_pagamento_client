class Cliente {
    constructor(props) {
        this.cpf = props.cpf
        this.nome = props.nome
        this.dataVencimento = props.dataVencimento
        this.valor = props.valor
        this.pago = props.isPago
        this.empresa = props.empresa
        this.periodo = props.periodo
    }

    getProps() {
        return {
            cpf: this.cpf,
            nome: this.nome,
            dataVencimento: new Date(this.dataVencimento).toLocaleDateString('pt-BR'),
            valor: Number(this.valor).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}),
            pago: this.pago ? 'Pago' : 'Pendente'
        }
    }

    getDateString() {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
        return new Date(this.dataVencimento).toLocaleDateString('pt-BR', options).split('/').reverse().join('-')
    }
}