const axios = require('axios')
function FontePokemonAxios (_nomePokemon) {
  function pokemon () {}
}
function Pokemon (_dados) {
  function nome () { return _dados.name }
  function tipos () { return new TiposPokemon(_dados.types) }
  function habilidades () { return new HabilidadesPokemon(_dados.abilities) }
  return {nome,tipos,habilidades}
}
function TiposPokemon (_dados) {
  function nomes () {
    return _dados.map( (t) => t.type.name )
  }
  return {nomes}
}
function HabilidadesPokemon (_dados) {
  function nomes () {
    return _dados.map( (t) => t.ability.name )
  }
  return {nomes}
}
function RelacoesDanosPokemon (_dados) {
  
}
async function main () {
  var r = await axios.get('https://pokeapi.co/api/v2/pokemon/ditto')
  var p = new Pokemon(r.data)
  var ts = p.tipos()
  var hs = p.habilidades()
  console.log( hs.nomes() )
}
main()
