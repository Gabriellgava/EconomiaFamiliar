# Familia Financas

Aplicacao de controle financeiro familiar feita com HTML, Tailwind e JavaScript puro, agora conectada ao Supabase.

## Estrutura

```text
EconomiaFamiliar/
|-- index.html
|-- css/
|   `-- styles.css
|-- js/
|   |-- app.js
|   |-- config.js
|   |-- db.js
|   |-- layout.js
|   |-- state.js
|   |-- utils.js
|   `-- pages/
|       |-- dashboard.js
|       |-- despesas.js
|       |-- cartoes.js
|       |-- rendimentos.js
|       `-- saude.js
|-- supabase/
|   `-- schema.sql
`-- vercel.json
```

## Como conectar

1. Abra o Supabase.
2. Vá em `SQL Editor`.
3. Cole o conteúdo de [supabase/schema.sql](</c:/Users/gabriel.gava/Desktop/EconomiaFamiliar/supabase/schema.sql>).
4. Execute o script.
5. Publique o projeto normalmente.

O app usa uma familia padrão sem login, definida em [js/config.js](</c:/Users/gabriel.gava/Desktop/EconomiaFamiliar/js/config.js>).

## Observacao importante

Como voce pediu sem login, as tabelas foram configuradas para acesso anonimo pelo frontend. Isso funciona e simplifica bastante, mas e menos seguro do que um fluxo com autenticacao.
