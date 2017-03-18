$ErrorActionPreference = "Stop"

function Get-Settings($SettingsFile)
{
    $settings = @{}
    Get-Content $SettingsFile | foreach-object -begin { 
        $lineNo = 1
        $currentSection = @{} 
        $settings.Add("0", $currentSection) } -Process {
            # Match a comment line?
            if ($_.ToString().TrimStart().StartsWith('#'))
            {
            # Do nothing
            }
            # Match an empty line?
            elseif ($_.ToString().TrimStart().Length -eq 0)
            {
            # Do nothing
            }
            # Match a new section? 
            elseif ($_ -match '^\[(?<section>\w+)\]$')
            {
            $currentSection = @{}
            $settings.Add($matches.section, $currentSection)
            }
            # Match a string setting?
            elseif ($_ -match '^(?<key>\w+)\=\"(?<value>.+)\"$')
            {
            $currentSection.Add($matches.key, $matches.value)
            }
            # Match an integer setting?
            elseif ($_ -match '^(?<key>\w+)\=(?<value>([0-9]+))$')
            {
            $currentSection.Add($matches.key, [convert]::ToInt32($matches.value, 10) )
            }
            # Match a boolean setting?
            elseif ($_ -match '^(?<key>\w+)\=(?<value>(True|False)+)$')
            {
            $currentSection.Add($matches.key, ($matches.value -eq 'True'))
            }
            else
            {
            throw [Exception] "Invalid syntax in settings file ${settingsFile} on line #${lineNo}"
            }
            $lineNo = $lineNo + 1
        }
    $settings
}

function Set-Settings($SettingsFile, $Settings) {
    Set-Content $SettingsFile $null
    foreach($category in $Settings.Keys) {
        if ($category -ne "0") {
            Add-Content $SettingsFile "[${category}]"
            foreach ($setting in $Settings.Item($category).GetEnumerator()) {
                $value = $setting.Value
                $key = $setting.Name
                
                $settingFormat = "${key}=" + '"' + ${value} + '"'
                Add-Content $SettingsFile $settingFormat
               
            }
            
        }
        
    }
    
}

Export-ModuleMember Get-Settings, Set-Settings