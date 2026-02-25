# GitHub Actions Secrets Reference

Add these secrets at:
**GitHub Repo → Settings → Secrets and Variables → Actions → New repository secret**

---

## Frontend Workflow Secrets (`deploy-frontend.yml`)

| Secret Name                | Description                                               | Example Value                                              |
|----------------------------|-----------------------------------------------------------|------------------------------------------------------------|
| `HOSTINGER_SSH_PRIVATE_KEY`| Private key whose public key is in Hostinger authorized_keys | `-----BEGIN OPENSSH PRIVATE KEY-----\n...`            |
| `HOSTINGER_HOST`           | Hostinger server IP or hostname                           | `123.456.789.0`                                            |
| `HOSTINGER_USER`           | Hostinger FTP/SSH username                                | `u123456789`                                               |
| `HOSTINGER_DOCUMENT_ROOT`  | Absolute path to public_html on Hostinger                 | `/home/u123456789/public_html`                             |
| `NEXT_PUBLIC_API_URL`      | Backend REST API URL                                      | `https://api.potupartners.site`                             |
| `NEXT_PUBLIC_SOCKET_URL`   | Socket.io URL (same as API)                               | `https://api.potupartners.site`                             |
| `NEXT_PUBLIC_APP_URL`      | Frontend URL                                              | `https://potupartners.site`                                 |
| `NEXT_PUBLIC_CDN_URL`      | DigitalOcean Spaces CDN URL                               | `https://potupartners-files.sgp1.cdn.digitaloceanspaces.com` |

---

## Backend Workflow Secrets (`deploy-backend.yml`)

| Secret Name              | Description                                                 | Example Value              |
|--------------------------|-------------------------------------------------------------|----------------------------|
| `DO_SSH_PRIVATE_KEY`     | Private key for SSH access to DigitalOcean droplet          | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `DO_HOST`                | DigitalOcean droplet IP address                             | `123.456.789.1`            |
| `DO_USER`                | SSH user on the droplet (app user)                          | `potupartners`             |

---

## How to generate and add an SSH key pair

```bash
# 1. Generate a dedicated deploy key (do NOT use your personal key)
ssh-keygen -t ed25519 -C "github-actions-deploy@potupartners" -f ~/.ssh/potupartners_deploy -N ""

# 2. Add the PUBLIC key to each server's authorized_keys
#    For Hostinger:
cat ~/.ssh/potupartners_deploy.pub
# Paste this into Hostinger hPanel → SSH Access → Manage SSH Keys

#    For DigitalOcean VPS:
ssh root@YOUR_DROPLET_IP "echo '$(cat ~/.ssh/potupartners_deploy.pub)' >> /home/potupartners/.ssh/authorized_keys"

# 3. Add the PRIVATE key as a GitHub secret
cat ~/.ssh/potupartners_deploy
# Copy entire output (including BEGIN/END lines) → paste into GitHub secret

# 4. Delete the local private key (no longer needed locally)
rm ~/.ssh/potupartners_deploy
```

---

## Important Notes

- Use **separate deploy keys** for Hostinger and DigitalOcean (different servers = different keys)
- The private key values must include the full PEM header/footer lines
- Rotate keys every 6–12 months or if a team member leaves
- Never use `*` permissions — secrets are only visible to GitHub Actions, not to PR forks
