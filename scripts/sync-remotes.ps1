$ErrorActionPreference = "Continue"

try { git remote add personal https://github.com/oaslananka/fovux.git 2>$null } catch {}
try { git remote add org https://github.com/oaslananka-lab/fovux.git 2>$null } catch {}

$branch = git branch --show-current
if ($branch) {
    git push personal $branch
    git push org $branch
}
git push personal --tags
git push org --tags
