const axios = require('axios')
function FontePokemonAxios (_nomePokemon) {
  async function pokemon () {
    var r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${_nomePokemon}`)
    return new Pokemon(r.data)
  }
  return {pokemon}
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
  return {nome,tipos,habilidades,toString}
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
  var p = await new FontePokemonAxios('ditto').pokemon()
  console.log( p.toString() )
}
main()
