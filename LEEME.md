# Un pequeño universo para Silvia

Experiencia web de cumpleaños servida en el puerto **5020**.

## Requisitos

- Python 3.10 o superior en Windows

## Instalación y ejecución (recomendado: Waitress)

```powershell
cd "c:\Users\ts02\Desktop\192.168.3.101\universo-silvia"
.\iniciar.ps1
```

## Alternativa: Flask directo

```powershell
cd "c:\Users\ts02\Desktop\192.168.3.101\universo-silvia"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

## Acceso

| Dónde | URL |
|--------|-----|
| Esta computadora | http://127.0.0.1:5020 |
| Otro equipo en la misma red Wi‑Fi/LAN | http://192.168.5.142:5020 |

Para confirmar la IPv4 de esta máquina:

```powershell
ipconfig
```

Busca la dirección **IPv4** del adaptador conectado a tu red (por ejemplo `192.168.5.142`).

## Firewall de Windows (solo si no carga desde otro PC)

No modifiques el firewall desde este proyecto sin quererlo. Si otro dispositivo no puede conectar, un administrador puede crear una regla **entrante** mínima:

- **Protocolo:** TCP  
- **Puerto local:** 5020  
- **Perfil:** Privado (red local)  
- **Acción:** Permitir  

Ejemplo en PowerShell **como administrador** (ajusta el nombre si ya existe):

```powershell
New-NetFirewallRule -DisplayName "Universo-Silvia-5020" `
  -Direction Inbound -Protocol TCP -LocalPort 5020 `
  -Action Allow -Profile Private
```

## Notas

- `debug=False` en producción compartida por LAN.  
- No hay base de datos, login ni subida de archivos.  
- El sonido es opcional y no se reproduce solo al abrir la página.
