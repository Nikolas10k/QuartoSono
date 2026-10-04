-- Expõe o schema quartosono na Data API (PostgREST) preservando os schemas já expostos.
-- Equivalente a: Dashboard → Project Settings → Data API → Exposed schemas → adicionar "quartosono".
-- Se alguém alterar essa lista pelo painel, mantenha "quartosono" nela.
-- Reverter: alter role authenticator reset pgrst.db_schemas; notify pgrst, 'reload config';
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, quartosono';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
