const axios = require('axios')
const rs = require('readline-sync')
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
  function contem (nome) {
    return false
  }
  function recuperar (nome) {
    return false
  }
  function salvar (dadosPokemon) {
    return false
  }
  return {contem,recuperar,salvar}
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
function RelacoesDanosPokemon (_dados) {
  
}
async function main () {
  var n = rs.question('Nome de Pokemón: ').trim()
  var a = new ArmazemArquivosJSON('./.pokemons')
  if (a.contem(n)) {
    var p = a.recuperar(n)
  } else {
    var p = await new FontePokemonAxios(n).pokemon()
  }
  if (!p) { console.log('Não consegui carregar o pokemón, tente de novo'); return }
  console.log( p.toString() )
}
main()
