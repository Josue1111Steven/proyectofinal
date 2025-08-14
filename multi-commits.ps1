# === Configuración de cuentas ===
$cuentas = @(
    @{usuario="Josue1111Steven"; email="jmirandav3@est.ups.edu.ec"; cantidad=7},
    @{usuario="Cesarmuz0"; email="legaw86963@fursee.com"; cantidad=7},
    @{usuario="Andresvillamar1"; email="komek79592@futebr.com"; cantidad=6}
)

# URL del repositorio
$repoUrl = "https://github.com/Josue1111Steven/proyecto-final.git"

# Archivo único donde se registran los cambios
$archivo = "registro_cambios.txt"

Write-Host "=== Script para commits con múltiples cuentas ===" -ForegroundColor Cyan
Write-Host "Repositorio: $repoUrl" -ForegroundColor Cyan
Write-Host "Archivo de cambios: $archivo" -ForegroundColor Cyan

# Configurar el repositorio remoto
git remote set-url origin $repoUrl

# Crear el archivo si no existe
if (-not (Test-Path $archivo)) {
    "Registro de cambios del proyecto" | Out-File -Encoding UTF8 $archivo
}

foreach ($cuenta in $cuentas) {
    Write-Host "`n============================" -ForegroundColor Yellow
    Write-Host "Cambiando a cuenta: $($cuenta.usuario)" -ForegroundColor Yellow
    Write-Host "============================" -ForegroundColor Yellow

    # Configurar Git para la cuenta actual
    git config user.name $cuenta.usuario
    git config user.email $cuenta.email

    # Pedir login solo una vez por cuenta
    Write-Host ">> Realiza un 'git pull' para iniciar sesión con esta cuenta" -ForegroundColor Cyan
    git pull origin main

    for ($i = 1; $i -le $cuenta.cantidad; $i++) {
        $numCommit = "$i de $($cuenta.cantidad)"
        Write-Host "`n>>> Commit $numCommit con cuenta: $($cuenta.usuario)" -ForegroundColor Yellow

        # Editar el archivo con el cambio
        Add-Content -Path $archivo -Value "Cambio $i por $($cuenta.usuario) - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

        # Commit y push
        git add $archivo
        git commit -m "Cambio $i por $($cuenta.usuario)"
        git push origin main

        Write-Host " Commit $numCommit enviado." -ForegroundColor Green
    }
}

Write-Host "`n=== Todos los commits han sido realizados. ===" -ForegroundColor Cyan
