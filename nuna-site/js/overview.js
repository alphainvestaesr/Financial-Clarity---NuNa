/* NuNa - overview.js: Visao Geral, KPIs, colaboracao, donut e Caixinha */
function kpiCard(lab,val,sub,cls){return '<div class="kpi"><div class="lab">'+lab+'</div><div class="val '+(cls||'')+'">'+val+'</div><div class="sub">'+sub+'</div></div>';}

function renderKPI(){
  var p=state.perfil, renda=rendaOf(state.mes,p), gasto=gastoOf(state.mes,p), sp=splitOf(state.mes,p);
  var saldo=saldoOf(state.mes,p);
  var liq=Math.max(0,saldo);
  var transf=liq*GOALS.reserva + liq*GOALS.investimentos;
  var aberto=CLOSED.indexOf(state.mes)<0;
  if(p==='NuNa'){
    el('ov-kpis').innerHTML=
      kpiCard('Despesas conjuntas', brl(gasto), 'custo da vida em comum no m&ecirc;s','red')+
      kpiCard('Pago pela Ana', brl(sp.conj*0+contribOf(state.mes).ana), 'inclui as premissas de casa','')+
      kpiCard('Pago pela Manuela', brl(contribOf(state.mes).manu), 'inclui transfer&ecirc;ncias pontuais','')+
      kpiCard('Renda do casal', brl(renda), 'Ana + Manuela'+(aberto&&DATA.months[state.mes].receita.Ana===0?' &mdash; sem contracheque da Ana':''),'green');
  } else {
    el('ov-kpis').innerHTML=
      kpiCard('Receitas', brl(renda), p==='Ana'?'vantagens do contracheque':'sal&aacute;rio + dividendos informados','green')+
      kpiCard('Despesas individuais', brl(sp.ind), 'consumo s&oacute; dela','red')+
      kpiCard('Conjuntas pagas por ela', brl(sp.conj), 'contribui&ccedil;&atilde;o para a casa','orange')+
      kpiCard('Saldo', brl(saldo), 'receitas &minus; individuais &minus; conjuntas', saldo>=0?'green':'red');
  }
  renderSplitNote(); renderCollab();
}
function renderSplitNote(){
  var box=el('ov-split'); if(!box) return;
  if(state.perfil==='NuNa'){
    var c=contribOf(state.mes), tot=c.ana+c.manu;
    box.innerHTML='<h3>De onde vem este total</h3><table><tbody>'+
      '<tr><td>Contas conjuntas pagas pela <b>Ana</b></td><td class="num">'+brl(c.ana)+'</td><td class="num">'+(tot?Math.round(c.ana/tot*100):0)+'%</td></tr>'+
      '<tr><td>Contas conjuntas pagas pela <b>Manuela</b></td><td class="num">'+brl(c.manu)+'</td><td class="num">'+(tot?Math.round(c.manu/tot*100):0)+'%</td></tr>'+
      '<tr class="tot"><td>Total NuNa do m&ecirc;s</td><td class="num">'+brl(tot)+'</td><td class="num">100%</td></tr></tbody></table>'+
      '<p class="note"><b>&#10003; Confer&ecirc;ncia:</b> '+brl(c.ana)+' (Ana) + '+brl(c.manu)+' (Manuela) = '+brl(tot)+'. Cada lan&ccedil;amento entra aqui uma &uacute;nica vez e tamb&eacute;m aparece no perfil de quem pagou &mdash; a mesma despesa vista de outro &acirc;ngulo, nunca uma segunda cobran&ccedil;a.'+
      (c.tr>0?' Inclui '+brl(c.tr)+' de contribui&ccedil;&atilde;o pontual da Manuela, que entra aqui do mesmo jeito que qualquer conta que a Ana paga.':'')+'</p>';
  } else {
    var sp=splitOf(state.mes,state.perfil), t=sp.ind+sp.conj, r=rendaOf(state.mes,state.perfil);
    box.innerHTML='<h3>Como o saldo de '+state.perfil+' se forma</h3><table><tbody>'+
      '<tr><td>Receitas</td><td class="num">'+brl(r)+'</td><td class="num"></td></tr>'+
      '<tr><td>&minus; Despesas <b>individuais</b></td><td class="num">'+brl(sp.ind)+'</td><td class="num">'+(t?Math.round(sp.ind/t*100):0)+'% dos gastos</td></tr>'+
      '<tr><td>&minus; Despesas <b>conjuntas</b> pagas por ela</td><td class="num">'+brl(sp.conj)+'</td><td class="num">'+(t?Math.round(sp.conj/t*100):0)+'% dos gastos</td></tr>'+
      '<tr class="tot"><td>= Saldo</td><td class="num '+((r-t)>=0?'green':'red')+'">'+brl(r-t)+'</td><td></td></tr></tbody></table>'+
      '<p class="note">A linha &ldquo;conjuntas&rdquo; &eacute; exatamente a fatia dela dentro do total do perfil NuNa &mdash; o mesmo dinheiro, contado uma vez s&oacute;.</p>';
  }
}
function renderCollab(){
  var card=el('collab-card'); if(!card) return;
  if(state.perfil!=='NuNa'){card.hidden=true;return;}
  card.hidden=false;
  var c=contribOf(state.mes), tot=c.ana+c.manu;
  var pa=tot?c.ana/tot*100:0, pm=tot?c.manu/tot*100:0;
  var dif=Math.abs(c.ana-c.manu), comp=Math.abs(c.ana-c.manu)/2;
  var quem = c.ana>c.manu ? 'Ana' : (c.manu>c.ana ? 'Manuela' : null);
  el('collab-kpis').innerHTML=
    kpiCard('Total conjunto', brl(tot), 'no m&ecirc;s de '+state.mes,'')+
    kpiCard('Diferen&ccedil;a de contribui&ccedil;&atilde;o', brl(dif), quem?quem+' pagou mais':'empate','orange')+
    kpiCard('Para igualar 50/50', brl(comp), quem? (quem==='Ana'?'Manuela':'Ana')+' precisaria repassar':'j&aacute; est&aacute; igual','');
  el('collab-bar').innerHTML=
    '<div class="cbar">'+
    '<span style="width:'+pa.toFixed(1)+'%;background:#4A6FA5">'+(pa>=12?'Ana '+Math.round(pa)+'%':'')+'</span>'+
    '<span style="width:'+pm.toFixed(1)+'%;background:#6F4E7C">'+(pm>=12?'Manuela '+Math.round(pm)+'%':'')+'</span></div>'+
    '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--tx3)"><span>Ana '+brl(c.ana)+' &middot; '+pa.toFixed(1)+'%</span><span>Manuela '+brl(c.manu)+' &middot; '+pm.toFixed(1)+'%</span></div>';
  el('collab-note').innerHTML = quem
    ? '<b>Saldo de colabora&ccedil;&atilde;o:</b> '+quem+' contribuiu '+brl(dif)+' a mais neste m&ecirc;s. Para uma divis&atilde;o 50/50, '+(quem==='Ana'?'Manuela':'Ana')+' repassaria '+brl(comp)+'.'
    : 'Contribui&ccedil;&atilde;o equilibrada neste m&ecirc;s.';
}
var donutChart=null;
function renderDonut(){
  var tot=catTotals(txOf(state.mes,state.perfil));
  var arr=Object.keys(tot).map(function(k){return [k,tot[k]]}).sort(function(a,b){return b[1]-a[1]});
  var soma=arr.reduce(function(s,a){return s+a[1]},0);
  el('donut-legend').innerHTML=arr.map(function(a){
    return '<li><span class="sw" style="background:'+colorOf(a[0])+'"></span><span class="nm">'+a[0]+'</span><span class="vv">'+brl(a[1])+' &middot; '+(soma?Math.round(a[1]/soma*100):0)+'%</span></li>';}).join('');
  var ctx=el('donut'); if(!ctx||typeof Chart==='undefined')return;
  if(donutChart)donutChart.destroy();
  donutChart=new Chart(ctx,{type:'doughnut',
    data:{labels:arr.map(function(a){return a[0]}),datasets:[{data:arr.map(function(a){return a[1]}),backgroundColor:arr.map(function(a){return colorOf(a[0])}),borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{display:false},
      tooltip:{callbacks:{label:function(c){return c.label+': '+brl(c.raw)}}}}}});
}
function caixaCasal(mes){
  return rendaOf(mes,'Ana')+rendaOf(mes,'Manuela') - gastoOf(mes,'Ana') - gastoOf(mes,'Manuela');
}
function renderTransfers(){
  var saldo = state.perfil==='NuNa' ? caixaCasal(state.mes) : saldoOf(state.mes,state.perfil);
  var liq=Math.max(0,saldo), renda=rendaOf(state.mes,state.perfil);
  var items=[['Reserva de Emerg&ecirc;ncia',liq*GOALS.reserva,'10% do saldo dispon&iacute;vel'],
             ['Investimentos',liq*GOALS.investimentos,'15% do saldo dispon&iacute;vel']];
  el('caixinha-total').innerHTML = brl(liq*GOALS.reserva + liq*GOALS.investimentos);
  el('transfers').innerHTML=items.map(function(it,i){
    var key=state.perfil+'.'+state.mes+'.'+i, tr=Store.get(K.TRANSF,{}), on=!!tr[key];
    return '<label class="chk"><input type="checkbox" data-k="'+key+'"'+(on?' checked':'')+'><span class="n">'+it[0]+'<br><span style="font-size:11px;color:var(--tx3)">'+it[2]+'</span></span><span class="v">'+brl(it[1])+'</span></label>';}).join('');
  [].forEach.call(el('transfers').querySelectorAll('input'),function(c){c.onchange=function(){
    var tr=Store.get(K.TRANSF,{}); if(c.checked) tr[c.dataset.k]=1; else delete tr[c.dataset.k]; Store.set(K.TRANSF,tr); }});
  var base = state.perfil==='NuNa' ? 'Base: o caixa do casal no m&ecirc;s (renda das duas menos <b>todos</b> os gastos das duas, individuais inclusive) &mdash; '+brl(saldo)+'. ' : '';
  base += 'Imposto de Renda e INSS/Funaprev j&aacute; saem no contracheque e <b>n&atilde;o</b> contam como dispon&iacute;vel para a Caixinha.';
  el('transfers-note').innerHTML = (saldo<=0 ? 'Este m&ecirc;s fechou no vermelho, ent&atilde;o n&atilde;o h&aacute; saldo para transferir. Primeiro alvo: zerar o d&eacute;ficit. ' : '') + base;
}
function renderSavingsTracker(){
  var l=txOf(state.mes,state.perfil);
  var pode=l.filter(function(t){return t.status==='pode cancelar'}).reduce(function(s,t){return s+t.valor},0);
  var canc=l.filter(function(t){return t.status==='cancelado'}).reduce(function(s,t){return s+t.valor},0);
  el('sv-pode').textContent=brl(pode); el('sv-canc').textContent=brl(canc);
  el('sv-year').innerHTML = pode>0 ? 'Se cancelar tudo da coluna &ldquo;pode cancelar&rdquo;, voc&ecirc; economiza <b>'+brl(pode*12)+'</b> por ano.'
    : 'Nada marcado ainda. Abra a aba Transa&ccedil;&otilde;es e use a coluna Status para marcar o que d&aacute; pra cortar.';
}
function renderOverviewInsight(){
  var med=CLOSED.map(function(m){return saldoOf(m,state.perfil)}).reduce(function(a,b){return a+b},0)/CLOSED.length;
  el('ins-ov').textContent = state.perfil==='NuNa'
    ? '"Em '+CLOSED.length+' meses fechados, a vida em comum custou em media '+brl(-med)+'/mes."'
    : '"Em '+CLOSED.length+' meses fechados, o saldo de '+state.perfil+' ficou em media '+brl(med)+'/mes."';
}
