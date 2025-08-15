# MedScheduler (simples)

API de agendamento médico com **.NET 8 + EF Core + PostgreSQL + JWT**. Inclui container de **migrations** e **triagem** de especialidade (mock por palavras‑chave ou **OpenAI**, opcional).

## Stack
- **Backend**: ASP.NET Core 8 (Web API), Entity Framework Core + Npgsql (PostgreSQL), JWT (roles: Paciente, Medico)
- **Infra**: Docker Compose (postgres, migration, api, web opcional)

## Frontend (Tecnologias)
- **Next.js 14**
- **React 18**
- **TypeScript 5**
- **ESLint** (config Next)
> A URL da API é lida de `NEXT_PUBLIC_API_URL` (padrão: `http://api:8080`).

## Como rodar (Docker)
1) Crie um arquivo **.env** na raiz (já existe no projeto; ajuste se necessário).
2) Suba tudo (com Docker Desktop aberto):
```bash
docker compose up --build
```
3) API: **http://localhost:8080**  
   Swagger: **http://localhost:8080/swagger**  
   Frontend (se usar): **http://localhost:3000**

### Parar/limpar
```bash
# parar mantendo dados
docker compose down

# parar limpando volumes (zera o banco)
docker compose down --volumes --remove-orphans
```

## .env (exemplo mínimo, por padrão já no projeto)
```env
# portas
API_PORT=8080
WEB_PORT=3000
DB_PORT=5432

# banco
DB_USER=postgres
DB_PASS=postgres
DB_NAME=medscheduler

# jwt (>= 32 bytes)
JWT_KEY=DEV_SUPER_SECRET_CHANGE_ME_32BYTES_MINIMUM_1234567890
JWT_ISSUER=medscheduler
JWT_AUDIENCE=medscheduler-clients

# triagem: openai | keyword
TRIAGEM_PROVIDER=keyword
# se usar openai:
# OPENAI_API_KEY=coloque_sua_chave_aqui

# frontend (opcional)
NEXT_PUBLIC_API_URL=http://api:8080
```

> O serviço **migration** roda antes da API e aplica `dotnet ef database update` automaticamente.

## Endpoints principais
### Auth
- `POST /auth/register` → cria usuário (não retorna token)
- `POST /auth/login` → retorna `{ token, name, email, role }`  

No Swagger, clique **Authorize** e informe: `Bearer <seu_token>`.

## Roles (Papéis)
Numérico para facilitar testes no Swagger:
```
Paciente = 1
Medico   = 2
```

### Paciente
- `POST /paciente/agendamentos` → cria agendamento (salva `RecommendedSpecialty`)
- `GET /paciente/agendamentos` → lista do paciente autenticado

### Médico
- `GET /medico/agendamentos?data=YYYY-MM-DD` → agenda do médico no dia

### Médicos
- `GET /medicos` → lista todos com `role= Medico || 2`

### Triagem
- `POST /mock/triagem` → triagem **mock** (palavras‑chave)
- `POST /triagem` → usa **estratégia ativa** (`TRIAGEM_PROVIDER=openai` usa OpenAI; senão mock)

## Observações rápidas
- **JWT_KEY** precisa ter **>= 32 bytes**.
- Para usar **OpenAI**, defina `TRIAGEM_PROVIDER=openai` e `OPENAI_API_KEY` no `.env`.
- Em dev, a API roda com **dotnet watch** dentro do container (hot reload).
