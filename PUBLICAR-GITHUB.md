# Publicar en GitHub (una sola vez)

El proyecto ya tiene git y un commit listo. Falta **entrar a GitHub** desde esta PC.

## 1. Iniciar sesión en GitHub CLI

En PowerShell:

```powershell
cd "c:\Users\ts02\Desktop\192.168.3.101\universo-silvia"
gh auth login
```

Elige: GitHub.com → HTTPS → Login with a web browser. Copia el código que te pide y autoriza en el navegador.

## 2. Crear el repo y subir

```powershell
gh repo create universo-silvia --public --source=. --remote=origin --push
```

Si el nombre `universo-silvia` ya existe en tu cuenta, usa otro nombre y cambia la URL final.

## 3. Activar GitHub Pages

```powershell
gh api repos/{owner}/universo-silvia/pages -X POST -f build_type=workflow
```

(Sustituye `{owner}` por tu usuario de GitHub, o usa la interfaz web.)

**O en la web:** repo → **Settings** → **Pages** → Source: **GitHub Actions**.

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) se ejecuta al hacer push a `main` y publica `index.html` + `static/`.

## 4. URL para el celular

En unos minutos:

`https://<TU-USUARIO>.github.io/universo-silvia/`

Comprueba el enlace en **Settings → Pages** del repo.

## Desarrollo local (opcional)

```powershell
.\iniciar.ps1
```

Abre `http://127.0.0.1:5020/`
