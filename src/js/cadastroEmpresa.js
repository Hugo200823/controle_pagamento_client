(async function() {
    const cadastroEmpresa = document.querySelector('#cadastroEmpresa')
    cadastroEmpresa.addEventListener('submit', (event) => {
        event.preventDefault()
        try {
            const nomeEmpresa = document.querySelector('#nomeCadastro')

            axios.post('http://localhost:3000/empresa', {
                nome: nomeEmpresa.value
            })
            alert('Empresa criada com sucesso!')
            nomeEmpresa.textContent = ''
        } catch (error) {
            console.log(error)
        }
    })

    const consultaEmpresa = document.querySelector('#pesquisarEmpresa')
    consultaEmpresa.addEventListener('submit', async (event) => {
        event.preventDefault()
        try {
            const nomeConsulta = document.querySelector('#nomeConsulta')
            try {
                const empresa = await axios.get(`http://localhost:3000/empresa/${nomeConsulta.value}`)   
                if(empresa && empresa.status == 200 && empresa.data) {
                    const nome = document.querySelector('#nome')
                    nome.value = empresa.data.nome
                    
                    const sectionResultadoPesquisa = document.querySelector('#resultadoPesquisa')
                    sectionResultadoPesquisa.setAttribute('class', 'd-block')

                    const atualizaEmpresa = document.querySelector('#nome')
                    atualizaEmpresa.setAttribute('data-nome-antigo', nome.value)

                }
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            console.log(error)
        }
    })

    const atualizaEmpresa = document.querySelector('#atualizaEmpresa')
    atualizaEmpresa.addEventListener('click', async () => {
        const nome = document.querySelector('#nome')
        try {
            await axios.put(`http://localhost:3000/empresa`, {
                nome: nome.value,
                nomeAntigo: nome.getAttribute('data-nome-antigo')
            })   
            alert('Empresa atualizada com sucesso')
        } catch (error) {
            console.log(error)
        }
    })

    const excluiEmpresa = document.querySelector('#excluiEmpresa')
    excluiEmpresa.addEventListener('click', async () => {
        const nome = document.querySelector('#nome')
        try {
            const confirma = confirm('A exclusão da empresa pode excluir todos os alunos dessa empresa. Continuar?')
            
            if(confirma) {
                await axios.delete(`http://localhost:3000/empresa/${nome.value}`)   
                alert('Empresa excluída com sucesso')
                location.reload()
            }
        } catch (error) {
            console.log(error)
        }
    })
})()