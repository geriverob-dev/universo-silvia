# Un pequeño universo para Silvia

Experiencia web interactiva de cumpleaños (HTML, CSS, JavaScript).

## En línea (GitHub Pages)

Tras publicar, la URL será:

`https://<tu-usuario>.github.io/universo-silvia/`

Activa Pages en el repo: **Settings → Pages → Deploy from branch `main` / root**.

## En local (opcional)

```powershell
cd universo-silvia
.\.venv\Scripts\python.exe -m waitress --listen=0.0.0.0:5020 app:app
```

Abre `http://127.0.0.1:5020/`

Dependencias: `pip install -r requirements.txt`
