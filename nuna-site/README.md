# NuNa · Financial Clarity

Primeira versão web do NuNa — o painel financeiro de Ana e Manuela, com três perfis
(individual de cada uma e o do casal) e consolidação automática das contas conjuntas.

Site estático: HTML, CSS e JavaScript puro, sem build, sem dependências de servidor.
Roda no GitHub Pages como está.

---

## Como publicar no GitHub Pages

1. Crie um repositório (por exemplo `nuna`) e envie **o conteúdo desta pasta** para a raiz dele.
2. No repositório: **Settings → Pages → Source: Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Em um ou dois minutos o site fica em `https://<seu-usuario>.github.io/<repositorio>/`.

O arquivo `.nojekyll` já está incluído — sem ele o GitHub ignora pastas iniciadas com `_`.

### Como rodar na sua máquina

O site lê `data/base.json` via `fetch`, então **não funciona abrindo o `index.html` com duplo clique**
(o navegador bloqueia leitura de arquivo local). Rode um servidor:

```bash
cd nuna-site
python3 -m http.server 8080
# abra http://localhost:8080
```

---

## Estrutura

```
.
├── index.html              Landing + login + shell do dashboard
├── .nojekyll               Impede o Jekyll de processar o site
├── README.md
├── assets/
│   └── favicon.svg
├── css/
│   ├── tokens.css          Variáveis de tema (claro/escuro). Mexa aqui para mudar cores
│   ├── app.css             Layout do dashboard
│   └── landing.css         Landing e tela de acesso
├── data/
│   └── base.json           Base importada: mar–out/2026, 995 lançamentos
└── js/
    ├── store.js            Camada de persistência (localStorage hoje, backend amanhã)
    ├── auth.js             Controle de acesso da interface
    ├── theme.js            Tema Claro / Escuro / Automático por horário
    ├── core.js             Montagem da base, helpers, seletores de perfil e mês
    ├── overview.js         Visão Geral, KPIs, colaboração, donut e Caixinha
    ├── transactions.js     Tabela de Transações, aba Revisar, exportação
    ├── charts.js           Gráficos e tabela de Orçamento
    ├── csv.js              Importação de CSV com proteção contra duplicidade
    ├── dados-ui.js         Aba Dados: importar, fechar mês, backup
    ├── gastei-store.js     Armazenamento e Núcleo de Inteligência do ACABEI DE GASTAR
    ├── gastei-ui.js        Interface do ACABEI DE GASTAR
    ├── agente.js           Relatório do Agente Financeiro e histórico mensal
    └── app.js              Insights, navegação e inicialização
```

Carregamento: `store → auth → theme → core → Chart.js → módulos → app`.
Cada módulo só depende dos anteriores; `app.js` é o único que inicializa.

---

## Acesso

Usuários `ana` e `manuela`, senha `nuna2026` para ambas.

Para trocar a senha, abra o console do navegador no site publicado e rode:

```js
Auth.hash('ana:sua-nova-senha')
```

Copie o resultado para o campo `hash` do usuário em `js/auth.js` e publique de novo.

**Sobre a segurança.** Isto é controle de acesso de *interface*, não proteção bancária.
A verificação roda no navegador e quem abrir o código-fonte consegue contorná-la — serve para
o site não ficar aberto a qualquer pessoa com o link. No dia em que os dados forem para um
servidor, isto precisa ser substituído por autenticação de backend de verdade.

---

## Onde os dados ficam

Tudo no `localStorage` do navegador, sob o prefixo `nuna.v1.`:

| Chave | Conteúdo |
|---|---|
| `sessao` | Sessão do login (expira em 12h) |
| `tema` | Claro / Escuro / Automático |
| `prefs` | Perfil, mês e eixo de categoria selecionados |
| `overrides` | Suas edições por lançamento: categoria, tipo, grupo, divisão, status, revisão |
| `orcamentos` | Metas de orçamento por perfil |
| `gastei` | Lançamentos do ACABEI DE GASTAR |
| `importados` | Linhas vindas de CSV |
| `fechamentos` | Meses marcados como fechados |
| `transferencias` | Itens da Caixinha já marcados |

Recarregar a página, fechar o navegador ou voltar dias depois **não apaga nada**.

O que isso ainda **não** faz: os dados ficam num navegador só. Abrir em outro aparelho mostra
a base original sem as suas edições. Use **Dados → Baixar backup** e **Restaurar backup** para
levar tudo de um aparelho para outro enquanto não existe banco online.

Limpar os dados do site no navegador apaga tudo. Faça backup antes.

---

## Regras financeiras implementadas

- **Consolidação sem duplicar.** Um lançamento marcado como CONJUNTA vive no perfil de quem pagou
  *e* aparece no perfil NuNa. `conjunto pago por Ana + conjunto pago por Manuela = total NuNa`,
  ao centavo, em todos os meses. A conferência aparece na tela.
- **Saldo individual** = receitas − despesas individuais − despesas conjuntas pagas pela pessoa.
  Pode ficar negativo, e fica.
- **Divisão** tem duas opções: INDIVIDUAL e CONJUNTA. Corrigir altera o lançamento existente,
  nunca cria um segundo.
- **Caixinha** = Reserva de Emergência (10%) + Investimentos (15%). IR e INSS não entram como
  disponível, porque já saem no contracheque.
- **Renda da Manuela**: R$ 2.000/mês de março a julho, R$ 4.280/mês de agosto em diante.
  De março a julho o perfil dela segue a regra fechada (terreno + telefone + contribuição NuNa,
  restante em Outros), então o saldo fecha em zero nesses meses.
- **Parcelamento do cartão**: o principal do PARC.FÁCIL fica fora do gasto do mês (são compras
  já contadas, só refinanciadas); juros e encargos entram.
- **Contribuições da Manuela** (R$ 797,96 em 04/03 e R$ 400,00 em 10/06) são lançamentos
  CONJUNTOS pagos por ela — mesmo tratamento das contas da Ana.

### Proteção contra duplicidade

Chave: `mês da fatura | fonte | data | descrição | valor`, mais um ordinal que separa repetições
legítimas do mesmo dia (dois abastecimentos de R$ 100 são compras distintas). Cada lançamento tem
um `uid` derivado dessa chave.

- Importar o mesmo CSV duas vezes **não** cria nada.
- **Fatura de cartão:** escolha o mês da fatura na importação. Uma parcela comprada em março
  pertence à fatura de setembro — sem isso ela não casa com o que já está na base.
- **Extrato de conta:** deixe em "usar a data de cada linha".
- Na dúvida, marca para revisão. Nunca descarta nem duplica em silêncio.

### ACABEI DE GASTAR e conciliação

Registro rápido no momento da compra, nos perfis Ana e Manuela. O Núcleo de Inteligência sugere
categoria, fonte e divisão por semelhança com o histórico (coeficiente de Dice sobre tokens
únicos, corte em 0,33).

A conciliação pontua **descrição 50% + fonte 30% + proximidade de data 20%**:
acima de 0,72 concilia sozinho, entre 0,42 e 0,72 marca **Revisar**.

**Regra anti-duplicidade:** um lançamento com status **Conciliado** sai dos totais, porque a
versão oficial dele já está na base importada. Um gasto novo soma ao mês; um gasto que já existe
na fatura soma zero.

---

## Limitações dos dados

A base vem só de faturas de cartão e contracheques. Energia, internet, gás, água, CRMV e tudo
pago por boleto, débito, Pix ou dinheiro **não aparece**. Ausência de lançamento não significa
ausência de despesa.

Aluguel+Água (R$ 802,88), Terreno (R$ 860) e telefone da Manuela (R$ 35) entram como premissa
informada, não como lançamento comprovado. A renda da Manuela é informada, sem contracheque.
Setembro está sem o contracheque da Ana; outubro é a fatura ainda aberta.

---

## Para onde isso cresce

A arquitetura foi separada pensando em não precisar reconstruir:

- **Banco online** — reimplemente `Store.get/set/remove` em `js/store.js` de forma assíncrona.
  É o único arquivo que toca armazenamento; nenhum outro módulo chama `localStorage` direto.
- **Contas individuais e sincronização entre aparelhos** — `js/auth.js` vira cliente de um
  serviço de autenticação; a sessão já é um objeto com usuário, perfil e expiração.
- **Integrações bancárias** — `js/csv.js` já separa leitura, normalização e deduplicação;
  um conector de API entrega linhas no mesmo formato e reusa a proteção contra duplicidade.
- **App iOS** — `data/base.json` documenta o modelo: lançamento com os dois eixos de categoria,
  grupo conjunto, divisão, fonte, uid e chave de deduplicação.
- **Agente Financeiro mais capaz** — `js/agente.js` concentra a geração de resumo, dicas e
  alertas; hoje são regras locais, amanhã pode ser uma chamada de modelo.
