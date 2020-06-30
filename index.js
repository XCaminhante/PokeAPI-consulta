const axios = require('axios')
const rs = require('readline-sync')
const fs = require('fs')
const path = require('path')
// Fontes:
function FontePokemonAxios (_nome) {
  async function pokemon () {
    try {
      var r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${_nome}`)
      return new Pokemon(r.data)
    } catch (e) {
      return false
    }
  }
  return {pokemon}
}
function ArmazemPokemonsJSON (_caminho) {
  fs.mkdirSync(_caminho, {recursive:true})
  function jsonPokemon (nome) { return path.join(_caminho, nome+'.json') }
  function contem (nome) { return fs.existsSync(jsonPokemon(nome)) }
  function listar () { return fs.readdirSync(_caminho).map( (f) => f.split('.json')[0] ) }
  function salvar (dados) {
    try {
      var nome = dados.name
      var j = JSON.stringify(dados)
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
  return {contem,listar,salvar,apagar,recuperarPokemon}
}
function FonteTipoPokemonAxios (_dados) {
  async function tipo () {
    try {
      var nome = _dados.name
      var r = await axios.get(`https://pokeapi.co/api/v2/type/${nome}`)
      Object.assign(_dados,r.data)
      return new TipoPokemon(_dados)
    } catch (e) {
      return false
    }
  }
  return {tipo}
}
function FonteHabilidadePokemonAxios (_dados) {
  async function habilidade () {
    try {
      var nome = _dados.name
      var r = await axios.get(`https://pokeapi.co/api/v2/ability/${nome}`)
      Object.assign(_dados,r.data)
      return new HabilidadePokemon(_dados)
    } catch (e) {
      return false
    }
  }
  return {habilidade}
}
// Coleções:
function TiposPokemon (_dados) {
  function nomes () { return _dados.map( (t) => t.type.name ) }
  async function tipo (nome) {
    var dadosTipo = _dados.filter( (t) => t.type.name == nome )
    if (!dadosTipo.length) { return false }
    if (!dadosTipo[0].type.id) { return new FonteTipoPokemonAxios(dadosTipo[0].type).tipo() }
    return new TipoPokemon(dadosTipo[0].type)
  }
  function toString () { return nomes().join(', ') }
  return {nomes,tipo,toString}
}
function HabilidadesPokemon (_dados) {
  function nomes () { return _dados.map( (t) => t.ability.name ) }
  function habilidade (nome) {
    var dadosHab = _dados.filter( (h) => h.ability.name == nome )
    if (!dadosHab.length) { return false }
    if (!dadosHab[0].ability.id) { return new FonteHabilidadePokemonAxios(dadosHab[0].ability).habilidade() }
    return new HabilidadePokemon(dadosHab[0].ability)
  }
  function toString () { return nomes().join(', ') }
  return {nomes,toString}
}
function RelacoesDanosPokemon (_dados) {
  function semDanoPara () {}
  function meioDanoPara () {}
  function duploDanoPara () {}
  function semDanoDe () {}
  function meioDanoDe () {}
  function duploDanoDe () {}
}
// Entidades:
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
  function salvarCom (armazem) { return armazem.salvar(_dados) }
  return {nome,tipos,habilidades,toString,salvarCom}
}
function TipoPokemon (_dados) {
  function nome () { return _dados.name }
  function relacoesDanos () { return new RelacoesDanosPokemon(_dados.damage_relations) }
  function nomesPokemonsDesteTipo () { return _dados.pokemon.map( (p) => p.pokemon.name ) }
  function toString () { return nome() }
  return {nome,relacoesDanos,nomesPokemonsDesteTipo,toString}
}
function HabilidadePokemon (_dados) {
  function nome () { return _dados.name }
  function selecEmIngles (recursos) { return recursos.filter( (r) => r.language.name == 'en' )[0] }
  function descricao () { return selecEmIngles(_dados.effect_entries).effect }
  function descricaoCurta () { return selecEmIngles(_dados.effect_entries).short_effect }
  return {nome,descricao,descricaoCurta}
}
// Interface:
function ConsolePokemon () {
  var armaz = new ArmazemPokemonsJSON('./.pokemons')
  // Principais:
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
  // Comandos:
  async function pokemon (nome) {
    console.log('Pesquisar pokemón:')
    if (armaz.contem(nome)) {
      console.log('Está salvo, recuperando do cache...')
      var p = armaz.recuperarPokemon(nome)
    } else {
      var p = await new FontePokemonAxios(nome).pokemon()
    }
    if (!p) { console.log('Não consegui carregar o pokemón, tente de novo'); return }
    console.log( p.toString() )
    talvezSalvar(p)
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
  // Auxiliares:
  function descreverHabilidades (pokemon) {}
  function relacoesDano (pokemon) {}
  function exemplosTipo (tipo) {}
  function talvezSalvar (pokemon) {
    if (!armaz.contem(pokemon.nome())) {
      if (!rs.keyInYNStrict('Salvar?',{guide:true})) {return}
      var salvo = pokemon.salvarCom(armaz)
      console.log( (salvo ? 'Salvo' : 'Não foi possível salvar') )
    }
  }
  return {operarContinuamente,ajuda}
}
var _c = new ConsolePokemon()
async function main () {
  console.log(_c.ajuda())
  _c.operarContinuamente()
}
main()
// Para fazer:
// 
// - | descrever as habilidades
//   | base feita, falta testar e implementar na interface
// 
// - | mostrar relações de dano à partir do pokemon consultado
// 
// - | separar classes em arquivos
// 
// - | exemplos de pokemon com o mesmo tipo deste
//   | base testada, falta implementar na interface
