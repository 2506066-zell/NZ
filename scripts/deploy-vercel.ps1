$ErrorActionPreference = 'Stop'
function Exec($cmd) { & cmd /c $cmd }
function EnsureVercel() { try { Exec "vercel --version" } catch { Exec "npx vercel --version" } }
function WhoAmI() { try { Exec "vercel whoami" } catch { Write-Output "Not logged in. Run: vercel login"; exit 1 } }
function PipeEnvAdd($name, $value, $envt) { if ($value) { $p = [System.Diagnostics.Process]::Start("vercel", "env add $name $envt"); $sw = $p.StandardInput; $sw.WriteLine($value); $sw.Close(); $p.WaitForExit() } }
EnsureVercel
WhoAmI
$db = $env:POSTGRES_URL
if (-not $db) { $db = $env:DATABASE_URL }
$jwt = $env:JWT_SECRET
$hash = $env:APP_PASSWORD_HASH
$plain = $env:APP_PASSWORD
if (-not $hash -and $plain) { $hash = & node -e "const b=require('bcryptjs');console.log(b.hashSync(process.argv[1],10))" "$plain" }
PipeEnvAdd "DATABASE_URL" $db "production"
PipeEnvAdd "JWT_SECRET" $jwt "production"
PipeEnvAdd "APP_PASSWORD_HASH" $hash "production"
PipeEnvAdd "DATABASE_URL" $db "preview"
PipeEnvAdd "JWT_SECRET" $jwt "preview"
PipeEnvAdd "APP_PASSWORD_HASH" $hash "preview"
Exec "vercel --prod"
