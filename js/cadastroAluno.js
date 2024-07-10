(async function() {
    try {
        await this.aplicarEmpresas()
        const cadastroAluno = document.querySelector('#cadastroAluno')
        cadastroAluno.addEventListener('submit', async (event) => {
            event.preventDefault()

            const cpf = document.querySelector('#cpfCadastro')
            const nome = document.querySelector('#nomeCadastro')
            const dtVencimento = document.querySelector('#dtVencimento')
            const valor = document.querySelector('#valor')
            const periodo = document.querySelector('#periodoCadastro')
            const empresa = document.querySelector('#empresa')
            const pago = document.querySelector('#pagouCadastro')

            try {
                await axios.post('http://localhost:3000/cliente', {
                    cpf: cpf.value,
                    nome: nome.value,
                    dataVencimento: dtVencimento.value,
                    valor: valor.value,
                    isPago: pago.checked,
                    empresa: {
                        nome: empresa.value
                    },
                    periodo: periodo.value
                })

                alert('Cliente cadastrado com sucesso!')

                this.limparCadastro(
                    cpf,
                    nome,
                    dtVencimento,
                    valor,
                    periodo,
                    empresa,
                    pago
                )
                
            } catch (error) {
                console.log(error)
            }
        })

        const buscarCliente = document.querySelector('#buscarCliente')
        buscarCliente.addEventListener('submit', async (event) => {
            event.preventDefault()

            const identificacao = document.querySelector('#identificacao')

            try {
                const clientes = await axios.get(`http://localhost:3000/cliente/${identificacao.value}`)

                if(clientes && clientes.status == 200 && clientes.data.length > 0) {
                    const resultadoPesquisa = document.querySelector('#resultadoPesquisa')
                    resultadoPesquisa.innerHTML = ''

                    for await (let cliente of clientes.data) {
                        await this.InsereResultadoDePesquisa(cliente, resultadoPesquisa)
                    }
                }     
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
})()

async function aplicarEmpresas() {
    const empresasElement = document.querySelector('#empresa')
    empresasElement.innerHTML = ''

    const empresas = await axios.get('http://localhost:3000/empresa')
    if(empresas && empresas.status == 200 && empresas.data.length > 0) {
        empresas.data.forEach(async (empresa, index) => {
            const option = document.createElement('option')
            if(index == 0) {
                option.setAttribute('selected', 'selected')
            }
            option.setAttribute('value', empresa.nome)
            option.textContent = empresa.nome
            empresasElement.appendChild(option)
        })

    }
}

async function limparCadastro(
    cpf,
    nome,
    dtVencimento,
    valor,
    periodo,
    empresa,
    pago
) {
    cpf.value = ''
    nome.value = ''
    dtVencimento.textContent = new Date()
    valor.value = ''
    periodo.value = ''
    empresa.value = 'Matutino'
    pago.textContent = false
}

async function InsereResultadoDePesquisa(cliente, resultadoPesquisa) {
    const clienteDto = new Cliente(cliente)
    const section = await this.montaSectionResultadoPesquisa(clienteDto)

    const form = document.createElement('form')
    form.appendChild(section)
    resultadoPesquisa.appendChild(form)

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const cpf = form.querySelector('#cpf')
        const nome = form.querySelector('#nome')
        const dtVencimento = form.querySelector('#dtVencimento')
        const valor = form.querySelector('#valor')
        const periodo = form.querySelector('#periodo')
        const empresa = form.querySelector('#empresa')
        const pago = form.querySelector('#pagou')

        try {
            await axios.post('http://localhost:3000/cliente', {
                cpf: cpf.value,
                nome: nome.value,
                dataVencimento: dtVencimento.value,
                valor: valor.value,
                isPago: pago.checked,
                empresa: {
                    nome: empresa.value
                },
                periodo: periodo.value
            })

            alert('Cliente atualizado com sucesso!')
        } catch (error) {
            console.log(error)
        }

    })
}

async function montaSectionResultadoPesquisa(clienteDto) {
    const empresas = await axios.get('http://localhost:3000/empresa')
    const section = document.createElement('section')
    section.innerHTML = `
        <hr class="my-5">
        <div class="mb-3">
            <label for="nome" class="form-label">CPF</label>
            <input type="text" class="form-control" value="${clienteDto.cpf}" id="cpf">
        </div>

        <div class="mb-3">
            <label for="nome" class="form-label">Nome</label>
            <input type="text" class="form-control" value="${clienteDto.nome}" id="nome">
        </div>
        <div class="mb-3">
            <label for="dtVencimento" class="form-label">Data vencimento</label>
            <input type="date" class="form-control" id="dtVencimento" value="${clienteDto.getDateString()}">
        </div>

        <div class="mb-3">
            <label for="valor" class="form-label">Valor</label>
            <input type="text" class="form-control" id="valor" value="${clienteDto.getProps().valor}">
        </div>

        <select class="form-select mb-3" aria-label="Default select example" id="empresa">
            ${
                empresas.data.map(empresa => {
                    return `<option ${empresa.nome == clienteDto.empresa.nome ? 'selected' : ''}>${empresa.nome}</option>`
                }).join(' ')
            }
        </select>

        <select class="form-select mb-3" aria-label="Default select example" id="periodo">
            <option value="Matutino" ${clienteDto.periodo == 'Matutino' ? 'selected' : ''}>Matutino</option>
            <option value="Vespertino" ${clienteDto.periodo == 'Vespertino' ? 'selected' : ''}>Vespertino</option>
        </select>

        <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="pagou" ${clienteDto.pago ? 'checked="true"' : ''}>
            <label class="form-check-label" for="pagou">Pago</label>
        </div>

        <button type="submit" class="btn btn-primary">Atualizar</button>
    `

    const excluirBtn = document.createElement('button')
    excluirBtn.setAttribute('type', 'button')
    excluirBtn.classList.add('btn', 'btn-danger', 'excluir')
    excluirBtn.textContent = 'Excluir'
    section.appendChild(excluirBtn)

    excluirBtn.addEventListener('click', async () => {
        const confirmaExclusao = confirm(`Confirmar exclusão do ${clienteDto.nome}? `)

        if(confirmaExclusao) {
            try {
                await axios.delete(`http://localhost:3000/cliente/${clienteDto.nome}/${clienteDto.cpf ? clienteDto.cpf : ''}`)
                alert('Cliente removido com sucesso!')
                location.reload()
            } catch (error) {
                console.log(error)
            }
        }
    })

    return section
}