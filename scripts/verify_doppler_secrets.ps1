$ErrorActionPreference = "Stop"
$dopplerProject = if ($env:DOPPLER_PROJECT) { $env:DOPPLER_PROJECT } else { "all" }
$dopplerConfig = if ($env:DOPPLER_CONFIG) { $env:DOPPLER_CONFIG } else { "main" }

if (-not (Test-Path ".doppler/secrets.txt")) {
    Write-Error ".doppler/secrets.txt not found."
    exit 1
}

$missing = @()
$secrets = Get-Content ".doppler/secrets.txt"
foreach ($line in $secrets) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) { continue }
    $result = doppler secrets get $line --plain --project $dopplerProject --config $dopplerConfig 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missing += $line
    }
}

if ($missing.Count -gt 0) {
    Write-Error "Missing Doppler secrets in $dopplerProject/$dopplerConfig : $($missing -join ', ')"
    exit 1
}
Write-Host "All Doppler secrets are present in ${dopplerProject}/${dopplerConfig}."
