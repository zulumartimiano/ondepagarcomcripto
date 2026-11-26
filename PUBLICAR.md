# Como publicar o ondepagarcomcripto de graça

Site no **GitHub Pages** + cadastro no **Supabase**. Nada aqui custa dinheiro.

## 1. Supabase (cadastro de empresas)
1. Em supabase.com, crie um projeto (plano Free).
2. Abra **SQL Editor > New query**, cole o conteúdo de `supabase.sql` e clique em **Run**.
3. Vá em **Project Settings > API** e copie:
   - **Project URL**
   - a chave **anon public** (nunca a `service_role`)
4. Cole os dois valores em `config.js`.

Como aprovar um cadastro: **Table Editor > places**. Mude `status` de `pending` para `approved`.
Se quiser, marque `verified` como true e corrija `lat` e `lng` (o cadastro chega com a posição do centro da cidade).

## 2. GitHub Pages (o site)
1. No GitHub, crie um repositório **público** (ex.: `ondepagarcomcripto`).
2. Envie todos os arquivos desta pasta para ele.
3. No repositório: **Settings > Pages > Build and deployment > Deploy from a branch**, escolha `main` e a pasta `/ (root)`, e salve.
4. Em 1 a 2 minutos o site abre em `https://SEU-USUARIO.github.io/ondepagarcomcripto/`.

## 3. Domínio próprio (opcional, não é grátis)
Registre `ondepagarcomcripto.com` ou `.com.br` e ligue em **Settings > Pages > Custom domain**.

## Antes de divulgar
- Aviso legal no rodapé: site informativo, sem vínculo com as lojas.
- Perguntar ao BTC Map (hello@btcmap.org) sobre a licença dos dados importados. A atribuição ao BTC Map e ao OpenStreetMap já está no rodapé.
- Testar o cadastro de ponta a ponta: enviar um, aprovar no Supabase e ver no mapa.
