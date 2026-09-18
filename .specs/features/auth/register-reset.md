# Auth Extension — Register & Password Reset

## Scope

- Self-registration (role PLAYER, auto-login)
- Password reset via email token (1h expiry)
- SMTP when configured; console log in dev

## API

| Method | Path | Public |
| ------ | ---- | ------ |
| POST | `/api/v1/auth/register` | yes |
| POST | `/api/v1/auth/forgot-password` | yes |
| POST | `/api/v1/auth/reset-password` | yes |

## Assumptions

| Decision | Default |
| -------- | ------- |
| Register role | PLAYER only |
| Reset token TTL | 1 hour |
| Email enumeration | forgot-password always returns 200 generic message |
| Email transport | nodemailer SMTP if `SMTP_HOST` set, else console |
| Reset link | `{APP_WEB_URL}?view=reset&token={token}` |
