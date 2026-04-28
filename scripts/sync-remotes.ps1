$ErrorActionPreference = "Stop"

$repoCanonical = "git@github.com:oaslananka/fovux.git"
$repoOrg = "git@github.com:oaslananka-lab/fovux.git"

if (-not (git remote | Select-String -Pattern "^personal$")) {
    git remote add personal $repoCanonical
}

if (-not (git remote | Select-String -Pattern "^org$")) {
    git remote add org $repoOrg
}

git fetch --all

$branch = git branch --show-current
if (![string]::IsNullOrWhiteSpace($branch)) {
    Write-Host "Pushing branch $branch to personal and org..."
    git push personal $branch
    git push org $branch
}

Write-Host "Pushing tags to personal and org..."
git push personal --tags
git push org --tags
