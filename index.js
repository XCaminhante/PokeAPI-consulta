const axios = require('axios')
const rs = require('readline-sync')
const fs = require('fs')
const path = require('path')
function FontePokemonAxios (_nomePokemon) {
  async function pokemon () {
    try {
      var r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${_nomePokemon}`)
      return new Pokemon(r.data)
    } catch (e) {
      return false
    }
  }
  return {pokemon}
}
function ArmazemArquivosJSON (_caminho) {
  fs.mkdirSync(_caminho, {recursive:true})
  function jsonPokemon (nome) { return path.join(_caminho, nome+'.json') }
  function contem (nome) { return fs.existsSync(jsonPokemon(nome)) }
  function listar () { return fs.readdirSync(_caminho).map( (f) => f.split('.json')[0] ) }
  function salvar (dadosPokemon) {
    try {
      var nome = dadosPokemon.name
      var j = JSON.stringify(dadosPokemon)
      fs.writeFileSync(jsonPokemon(nome), j)
      return true
    } catch (e) {
      return false
    }
  }
  function apagar (nome) {
    if (!contem(nome)) { return false }
    fs.unlinkSync(jsonPokemon(nome))
    return true
  }
  function recuperarPokemon (nome) {
    if (!contem(nome)) { return false }
    try {
      var d = fs.readFileSync(jsonPokemon(nome))
      var j = JSON.parse(d)
      return new Pokemon(j)
    } catch (e) {
      return false
    }
  }
  return {contem,listar,recuperarPokemon,salvar,apagar}
}
function Pokemon (_dados) {
  function nome () { return _dados.name }
  function tipos () { return new TiposPokemon(_dados.types) }
  function habilidades () { return new HabilidadesPokemon(_dados.abilities) }
  function toString () {
    return `Pokemon: ${nome()}
Tipos:
  ${tipos()}
Habilidades:
  ${habilidades()}`
  }
  function salvarCom (armazem) {
    return armazem.salvar(_dados)
  }
  return {nome,tipos,habilidades,toString,salvarCom}
}
function TiposPokemon (_dados) {
  function nomes () {
    return _dados.map( (t) => t.type.name )
  }
  function toString () {
    return nomes().join(', ')
  }
  return {nomes,toString}
}
function HabilidadesPokemon (_dados) {
  function nomes () {
    return _dados.map( (t) => t.ability.name )
  }
  function toString () {
    return nomes().join(', ')
  }
  return {nomes,toString}
}
function ConsolePokemon () {
  var armaz = new ArmazemArquivosJSON('./.pokemons')
  function prompt () {
    return 'pokeapi> '
  }
  function sair () {
    return 'Até mais!'
  }
  function ajuda () {
    return `
  API Pokemón

  Comandos:
    p <nome>  - pesquise pelo nome, possibilidade de salvar localmente
    l         - lista os pokemóns salvos
    r <nome>  - remova um pokemón salvo
    s         - sair
    qualquer outra coisa - mostra esta ajuda
  `
  }
  async function interacao () {
    var linha = rs.question(prompt()).split(' ')
    switch( linha[0].charAt(0) ) {
    case 'p': await pokemon(linha[1]); break
    case 'r': await remover(linha[1]); break
    case 'l': await listar(); break
    case 's': console.log(sair()); return false
    default: console.log(ajuda())
    }
    console.log('')
    return true
  }
  async function operarContinuamente () {
    var continuar = true
    while (continuar) {
      try {
        continuar = await interacao()
      } catch (e) {
        console.log('Problema: '+e)
        continuar = false
      }
    }
  }
  async function pokemon (nome) {
    console.log('Pesquisar pokemón:')
    var noCache = armaz.contem(nome)
    if (noCache) {
      console.log('Está salvo, recuperando do cache...')
      var p = armaz.recuperarPokemon(nome)
    } else {
      var p = await new FontePokemonAxios(nome).pokemon()
    }
    if (!p) { console.log('Não consegui carregar o pokemón, tente de novo'); return }
    console.log( p.toString() )
    if (!noCache) {
      if (!rs.keyInYNStrict('Salvar?',{guide:true})) {return}
      var salvo = p.salvarCom(armaz)
      console.log( (salvo ? 'Salvo' : 'Não foi possível salvar') )
    }
  }
  async function listar () {
    var lista = armaz.listar()
    if (!lista.length) { console.log('Nenhum pokemón salvo'); return }
    console.log('Pokemóns salvos:')
    var ident = '  '
    console.log( ident + lista.join('\n'+ident) )
  }
  async function remover (nome) {
    var lista = armaz.listar()
    if (!lista.length) { console.log('Nenhum pokemón salvo'); return }
    console.log('Remover pokemón:')
    console.log( ( armaz.apagar(nome) ? 'Feito' : 'Houve um problema' ) )
  }
  return {operarContinuamente,ajuda}
}
var _c = new ConsolePokemon()
async function main () {
  console.log(_c.ajuda())
  _c.operarContinuamente()
}
main()
