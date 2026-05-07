param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspaceRoot
)

$ErrorActionPreference = "Stop"

$targets = @(
    "personal-operating-system-mk1/k8s/overlays/aws",
    "personal-operating-system-mk2/k8s/overlays/aws",
    "personal-operating-system-mk3/k8s/overlays/aws"
)

$placeholderPattern = 'REPLACE_|<set-local-value>|<optional>|CHANGE_ME'
$violations = @()

foreach ($relativePath in $targets) {
    $fullPath = Join-Path $WorkspaceRoot $relativePath
    if (-not (Test-Path $fullPath)) {
        $violations += "[MISSING] $fullPath"
        continue
    }

    $yamlFiles = Get-ChildItem -Path $fullPath -Filter "*.yaml" -File |
        Where-Object { $_.Name -notlike "*.example.yaml" }

    foreach ($file in $yamlFiles) {
        $matches = Select-String -Path $file.FullName -Pattern $placeholderPattern
        if ($matches) {
            foreach ($m in $matches) {
                $relativeFile = $file.FullName.Replace($WorkspaceRoot, "").TrimStart('\', '/')
                $violations += "$relativeFile:$($m.LineNumber): $($m.Line.Trim())"
            }
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host "Placeholder or weak defaults found:" -ForegroundColor Red
    $violations | ForEach-Object { Write-Host " - $_" }
    exit 1
}

Write-Host "No placeholder issues found in overlay yaml files." -ForegroundColor Green
