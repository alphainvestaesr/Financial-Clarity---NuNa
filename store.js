/* ============================================================
   NuNa · store.js — camada de persistencia
   Toda gravacao do app passa por aqui. Hoje grava em localStorage;
   a interface (get/set/remove) foi desenhada para trocar por um
   backend online sem mexer no resto do codigo: basta reimplementar
   estes tres metodos de forma assincrona e adaptar os chamadores.
   ============================================================ */
var Store = (function () {
  var NS = 'nuna.v1.';
  var memoria = {};           // fallback quando localStorage esta bloqueado
  var temLS = (function () {
    try { var k = NS + '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();

  function get(chave, padrao) {
    try {
      var bruto = temLS ? localStorage.getItem(NS + chave) : memoria[chave];
      if (bruto == null) return padrao;
      return JSON.parse(bruto);
    } catch (e) { return padrao; }
  }
  function set(chave, valor) {
    var s = JSON.stringify(valor);
    try {
      if (temLS) localStorage.setItem(NS + chave, s); else memoria[chave] = s;
      return true;
    } catch (e) {
      memoria[chave] = s;
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        try { window.dispatchEvent(new CustomEvent('nuna:quota')); } catch (x) {}
      }
      return false;
    }
  }
  function remove(chave) {
    try { if (temLS) localStorage.removeItem(NS + chave); else delete memoria[chave]; } catch (e) {}
  }
  function chaves() {
    var r = [];
    try {
      if (temLS) { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i);
        if (k && k.indexOf(NS) === 0) r.push(k.slice(NS.length)); } }
      else r = Object.keys(memoria);
    } catch (e) {}
    return r;
  }
  function exportarTudo() {
    var o = { versao: 1, exportadoEm: new Date().toISOString(), dados: {} };
    chaves().forEach(function (k) { o.dados[k] = get(k, null); });
    return o;
  }
  function importarTudo(obj) {
    if (!obj || !obj.dados) return false;
    Object.keys(obj.dados).forEach(function (k) { set(k, obj.dados[k]); });
    return true;
  }
  return { get: get, set: set, remove: remove, chaves: chaves,
           exportarTudo: exportarTudo, importarTudo: importarTudo,
           disponivel: temLS, prefixo: NS };
})();

/* Chaves usadas pelo app — centralizadas para facilitar migracao */
var K = {
  SESSAO:      'sessao',
  TEMA:        'tema',
  PREFS:       'prefs',        // perfil, mes, eixo, filtros
  OVERRIDES:   'overrides',    // edicoes por uid: categoria, tipo, grupo, divisao, status, revisado
  ORCAMENTOS:  'orcamentos',
  GASTEI:      'gastei',       // ACABEI DE GASTAR
  IMPORTADOS:  'importados',   // linhas vindas de CSV
  FECHAMENTOS: 'fechamentos',  // meses fechados pelo usuario
  TRANSF:      'transferencias'
};
