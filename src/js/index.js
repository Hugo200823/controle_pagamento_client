(async function() {
    try {
        const empresasElement = document.querySelector('#empresas')
        empresasElement.innerHTML = ''
        await this.aplicarEmpresas(empresasElement)

        empresasElement.addEventListener('change', async (event) => {
            await this.buscarClientesPorEmpresa(event.target.value)
        })

        const btnVirarMes = document.querySelector('#virarMes')
        btnVirarMes.addEventListener('click', async () => {
            try {
                await axios.put('http://localhost:3000/cliente/virarMes')
                alert('Virada de mês processada com sucesso!')
                window.location.reload()
            } catch (error) {
                alert(`Erro ao virar mês: ${error.message}`)
            }
        })

        const btnExtrairDados = document.querySelector('#extrairDados')
        btnExtrairDados.addEventListener('click', () => {

            
        })

    } catch (error) {
        console.log(error)
    }
})()
        
async function aplicarEmpresas(empresasElement) {
    const empresas = await axios.get('http://localhost:3000/empresa')
    if(empresas && empresas.status == 200 && empresas.data.length > 0) {
        empresas.data.forEach(async (empresa, index) => {
            const option = document.createElement('option')
            if(index == 0) {
                option.setAttribute('selected', 'selected')
                await this.buscarClientesPorEmpresa(empresa.nome)
            }
            option.setAttribute('value', empresa.nome)
            option.textContent = empresa.nome
            empresasElement.appendChild(option)
        })

    }
}

async function buscarClientesPorEmpresa(nomeEmpresa) {
    this.limparBuscas()
    const clientesEmpresa = await axios.get(`http://localhost:3000/cliente/empresa/${nomeEmpresa}`)
    
    if(clientesEmpresa && clientesEmpresa.status == 200 && clientesEmpresa.data.length > 0) {
        this.inserirCabecalhos(Object.keys((new Cliente(clientesEmpresa.data[0]).getProps())))
        
        const sectionMatutino = document.querySelector('#matutino')
        const sectionVespertino = document.querySelector('#vespertino')

        clientesEmpresa.data.forEach((cliente) => {
            const clienteDto = new Cliente(cliente).getProps()
            switch(cliente.periodo.toLowerCase()) {   
                case 'matutino':
                    this.inserirCorpo(sectionMatutino, clienteDto)
                    break
                case 'vespertino':
                    this.inserirCorpo(sectionVespertino, clienteDto)
                    break
            }
        })

    }
}

function inserirCabecalhos(titulos) {
    const listaTitulo = document.querySelectorAll('.tituloLista')
    const titulosResult = titulos.map(titulo => `<td>${titulo}</td>`).join(' ')
    
    listaTitulo.forEach((tituloLista => {
        tituloLista.innerHTML = titulosResult
    }))
}

function inserirCorpo(elemento, cliente) {
    const corpoLista = elemento.querySelector('.corpoLista')
    const tr = document.createElement('tr')
    for(let key in cliente) {
        const td = document.createElement('td')
        td.textContent = cliente[key]

        td.addEventListener('click', async (event) => {
            event.preventDefault()

            const identificacao = cliente['nome']

            try {
                const clientes = await axios.get(`http://localhost:3000/cliente/${identificacao}`)

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

        if(key == 'pago') {
            if(cliente[key] == 'Pendente') {
                td.setAttribute('class', 'bg-danger text-light')
            } else {
                td.setAttribute('class', 'bg-success text-light')
            }
        }

        td.setAttribute('style', 'cursor: pointer;')
        tr.appendChild(td)
        corpoLista.appendChild(tr)
    }
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

function limparBuscas() {
    const listaCorpoLista = document.querySelectorAll('.corpoLista')
    listaCorpoLista.forEach(corpoLista => {
        corpoLista.innerHTML = ''
    })
}