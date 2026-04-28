$ErrorActionPreference = 'Stop'

# Setup remotes
try {
    git remote get-url lab | Out-Null
} catch {
    git remote add lab https://github.com/oaslananka-lab/fovux.git
}

Write-Host "Syncing to origin (canonical)..."
git push origin --all
git push origin --tags

Write-Host "Syncing to lab (mirror)..."
git push lab --all
git push lab --tags

Write-Host "Sync successful."
