$ErrorActionPreference = "Stop"

function Start-Server($mediaDir, $mediaIconDir) {
    Write-Host "Starting node server"
    Invoke-Command -ScriptBlock{nodemon -i .\scripts\info app.js $mediaDir $mediaIconDir -w ..\}
    for ($true) {
    }
}

try {
    cd $PSScriptRoot

    Import-Module .\Settings.psm1 -Force
    Import-Module .\scripts\getFileIcons.psm1 -Force

    $Settings = Get-Settings "./settings.txt" -Force

    $defaultRes = Read-Host -Prompt "Default Configuration (y or n)?"

    $script = "./scripts/getFileIcons.ps1"
    $mongoScript = "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"


    if ($defaultRes -eq "y") {
        $mediaDir = $Settings.Default.MediaDir
        $mediaIconDir = $Settings.Default.MediaIconDir
        
        Start-Job -ScriptBlock{param($mediaIconDir)Import-Module .\scripts\getFileIcons.psm1 -Force; Get-FileIcons -mediaIconDir $mediaIconDir} -ArgumentList $mediaIconDir
        
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -mediaDir $mediaDir -mediaIconDir $mediaIconDir

    } elseif ($defaultRes -eq "n") {
        $mediaDir = Read-Host -Prompt "Media Directory (backslash only)"
        $mediaIconDir = Read-Host -Prompt "Media Icons Directory (backslash only)"

        $newConfig = Read-Host -Prompt "Would you like to save these settings as default? (y or n)"

        if ($newConfig -eq "y") {
            $Settings.Default.MediaDir = $mediaDir
            $Settings.Default.MediaIconDir = $mediaIconDir

            Set-Settings settings.txt $Settings
        }
        Start-Job -ScriptBlock{${functionGet-FileIcons -mediaIconDir $mediaIconDir}}
        #Start-Job -ScriptBlock {param($Settings)./scripts/getFileIcons.ps1 $Settings.Default.MediaDir} -ArgumentList $Settings

        
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -mediaDir $mediaDir  -mediaIconDir $mediaIconDir
    }
} catch {throw $_}

finally {
    Stop-Job *
    Remove-Job *
}



