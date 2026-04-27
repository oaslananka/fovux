param(
    [string]$Branch = "main",
    [switch]$PushTags,
    [switch]$SkipOrgCi
)

$ErrorActionPreference = "Stop"

if (-not (git status --porcelain)) {
    # Working tree is clean
} else {
    Write-Error "Working tree is not clean. Commit or stash changes before syncing."
    exit 1
}

function Ensure-Remote($name, $url) {
    $existing = git remote get-url $name 2>$null
    if ($LASTEXITCODE -ne 0) {
        git remote add $name $url
    } elseif ($existing.Trim() -ne $url) {
        git remote set-url $name $url
    }
}

Ensure-Remote "github-personal" "git@github.com:oaslananka/fovux.git"
Ensure-Remote "github-org" "git@github.com:oaslananka-lab/fovux.git"
Ensure-Remote "azure" "git@ssh.dev.azure.com:v3/oaslananka/open-source/fovux"

Write-Output "Pushing branch $Branch to all remotes..."
git push github-personal $Branch
git push github-org $Branch
git push azure $Branch

if ($PushTags) {
    Write-Output "Pushing tags to all remotes..."
    git push github-personal --tags
    git push github-org --tags
    git push azure --tags
}

if (-not $SkipOrgCi) {
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Output "Triggering org CI in oaslananka-lab/fovux..."
        gh workflow run org-ci.yml --repo oaslananka-lab/fovux --ref $Branch
    } else {
        Write-Warning "GitHub CLI not found; org CI could not be manually dispatched."
    }
}

Write-Output ""
Write-Output "Sync Complete!"
Write-Output "Remotes:"
git remote -v
Write-Output "Pushed ref: $Branch"
