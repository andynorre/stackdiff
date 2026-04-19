# stackdiff

> CLI tool to compare environment variable sets across `.env` files and deployment configs

## Installation

```bash
npm install -g stackdiff
```

## Usage

Compare two or more environment sources:

```bash
# Compare two .env files
stackdiff .env .env.production

# Compare a .env file against a deployment config
stackdiff .env deploy/staging.yml

# Show only missing keys
stackdiff .env .env.production --missing-only
```

**Example output:**

```
KEY                  .env        .env.production
─────────────────────────────────────────────────
DATABASE_URL         ✔ set       ✔ set
API_SECRET           ✔ set       ✗ missing
REDIS_URL            ✗ missing   ✔ set
DEBUG                ✔ set       ✔ set
```

## Options

| Flag             | Description                          |
|------------------|--------------------------------------|
| `--missing-only` | Show only keys absent in any source  |
| `--values`       | Include values in the diff output    |
| `--json`         | Output results as JSON               |

## Supported Formats

- `.env` / `.env.*`
- `docker-compose.yml`
- Heroku `app.json`
- Vercel / Netlify config files

## License

[MIT](LICENSE)