$ErrorActionPreference = "Stop"

function Start-Server($ipAddr, $mediaDir) {
    Invoke-Command -ScriptBlock{nodemon -i .\scripts\info app.js $ipAddr $mediaDir -w ..\API}
    for ($true) {
    }
}

try {
    cd $PSScriptRoot

    Import-Module .\Settings.psm1 -Force

    $Settings = Get-Settings "./settings.txt" -Force

    $defaultRes = Read-Host -Prompt "Default Configuration (y or n)?"

    $script = "./scripts/getFileIcons.ps1"
    $mongoScript = "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"


    if ($defaultRes -eq "y") {
        $ipAddr = $Settings.Default.IPAddress
        $mediaDir = $Settings.Default.MediaDir
        Start-Job -FilePath $script

        
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -ipAddr $ipAddr -mediaDir $mediaDir

    } elseif ($defaultRes -eq "n") {
        $ipAddr = Read-Host -Prompt "IP Address"
        $mediaDir = Read-Host -Prompt "Media Directory (backslash only)"

        Start-Job -FilePath $script

        
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -ipAddr $ipAddr -mediaDir $mediaDir
    }
} catch {}

finally {
    Stop-Job *
    Remove-Job *
}



