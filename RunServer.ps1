#The purpose of this script is to make the running and changing of server settings much easier. Since there are multiple files that have to be run, I wanted to make a single file that does all of that plus allow you to change server settings.

$ErrorActionPreference = "Stop"

#Takes the media directories that the user specifies and runs the main server.
function Start-Server($mediaDir, $mediaIconDir) {
    Write-Host "Starting node server"
    Invoke-Command -ScriptBlock{nodemon -i .\scripts\info app.js $mediaDir $mediaIconDir -w ..\}
    for ($true) {
    }
}

try {
    cd $PSScriptRoot #Changes directory to the script directory which is in the root folder of the server

    Import-Module .\Settings.psm1 -Force #imports custom functions/modules I made (seperate file)

    $Settings = Get-Settings "./settings.txt" -Force #function to read from a settings.txt and format them into a dictionary/object with keys and values.

    $defaultRes = Read-Host -Prompt "Default Configuration (y or n)?" #Reads response from user
    if ($defaultRes.ToLower() -ne "y" -and $defaultRes.ToLower() -ne "n") {
        for ($defaultRes.ToLower() -ne "y" -and $defaultRes.ToLower() -ne "n") { #Repeats until the user replies with y or n
            $defaultRes = Read-Host -Prompt "Default Configuration (y or n)?"
            if($defaultRes.ToLower() -eq "y" -or $defaultRes.ToLower() -eq "n") {
                break
            }
        }
    }

    $mongoScript = "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"


    if ($defaultRes -eq "y") { #if the response is yes, use the default settings that were assigned, and start each component of the server asynchronously
        $mediaDir = $Settings.Default.MediaDir 
        $mediaIconDir = $Settings.Default.MediaIconDir
                
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -mediaDir $mediaDir -mediaIconDir $mediaIconDir

    } elseif ($defaultRes -eq "n") { #if the response is no, ask for new settings
        $mediaDir = Read-Host -Prompt "Media Directory (backslash only)"
        $mediaIconDir = Read-Host -Prompt "Media Icons Directory (backslash only)"

        $newConfig = Read-Host -Prompt "Would you like to save these settings as default? (y or n)" #Asks user if they want to save the new settings as default

        if ($newConfig -eq "y") { #if yes, set the settings to default, and run a function that saves it to the file in a specified format to be able to be edited by file if chosen.
            $Settings.Default.MediaDir = $mediaDir
            $Settings.Default.MediaIconDir = $mediaIconDir

            Set-Settings settings.txt $Settings
        }        
        Start-Job -ScriptBlock{param($mongoScript)Invoke-Command -ScriptBlock {param($mongoScript)cd C:/; cmd.exe /C $mongoScript} -ArgumentList $mongoScript} -ArgumentList $mongoScript
        Start-Sleep -Seconds 3
        Start-Server -mediaDir $mediaDir  -mediaIconDir $mediaIconDir
    }
} catch {throw $_}

finally { #After everything, stop the jobs, and remove jobs or error
    Stop-Job *
    Remove-Job *
}



