/* ============================================================
   NuNa · auth.js — controle de acesso da interface
   ATENCAO: isto e controle de acesso de INTERFACE, nao seguranca
   bancaria. A verificacao roda no navegador; qualquer pessoa com
   acesso ao codigo-fonte consegue contorna-la. Quando os dados
   forem para um servidor, troque por autenticacao de backend.
   ============================================================ */
var Auth = (function () {
  /* Hash simples (FNV-1a) so para nao deixar a senha em texto puro
     no repositorio. Nao substitui hashing real com sal no servidor. */
  function hash(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  /* usuarios: senha "nuna2026" para os dois. Troque os hashes abaixo
     rodando Auth.hash('sua-nova-senha') no console. */
  var USUARIOS = {
    'ana':     { hash: hash('ana:nuna2026'),     nome: 'Ana',     perfil: 'Ana' },
    'manuela': { hash: hash('manuela:nuna2026'), nome: 'Manuela', perfil: 'Manuela' }
  };
  var DURACAO = 12 * 60 * 60 * 1000; // 12h

  function entrar(usuario, senha) {
    var u = String(usuario || '').trim().toLowerCase();
    var reg = USUARIOS[u];
    if (!reg || reg.hash !== hash(u + ':' + senha)) return null;
    var sessao = { usuario: u, nome: reg.nome, perfil: reg.perfil, expiraEm: Date.now() + DURACAO };
    Store.set(K.SESSAO, sessao);
    return sessao;
  }
  function sessao() {
    var s = Store.get(K.SESSAO, null);
    if (!s || !s.expiraEm || Date.now() > s.expiraEm) { Store.remove(K.SESSAO); return null; }
    return s;
  }
  function sair() { Store.remove(K.SESSAO); }
  return { entrar: entrar, sessao: sessao, sair: sair, hash: hash };
})();
