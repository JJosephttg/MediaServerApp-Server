$ErrorActionPreference = 'Stop'

cd D:/Dev/MediaAppServer/API/scripts

Add-Type -AssemblyName System.Drawing

Add-Type -Path ..\dll\Microsoft.WindowsAPICodePack.Shell.dll
Add-Type -Path ..\dll\Microsoft.WindowsAPICodePack.dll

Import-Module ..\dll\Microsoft.WindowsAPICodePack.dll
Import-Module ..\dll\Microsoft.WindowsAPICodePack.Shell.dll

#Temp directory
$root = 'E:\'

#Function to convert to json with the image path for both if length is greater OR equal to 1, and then appends the list to a file called AddedFiles.json
function Update-List($fileList) {
    $files = @()
    if (!$fileList.root.file.length) {
        $fileProperties = @{
            name=$fileList.root.file.name
            category=$fileList.root.file.category
            path=$fileList.root.file.path
            ext=$fileList.root.file.ext
            imgLoc=$fileList.root.file.imgLoc
        }
        $fileObject = New-Object PSObject -Property $fileProperties
        $files += $fileObject
        $files = ConvertTo-Json $files
        New-Item .\info\AddedFiles.json -Value $files
    } else {
        $files = @()
        for($i = 0; $i -lt $fileList.root.file.Length; $i++) {
            if ($fileList.root.file[$i].path) {
                $fileProperties = @{
                    name=$fileList.root.file[$i].name
                    category=$fileList.root.file[$i].category
                    path=$fileList.root.file[$i].path
                    ext=$fileList.root.file[$i].ext
                    imgLoc=$fileList.root.file[$i].imgLoc
                }
                $fileObject = New-Object PSObject -Property $fileProperties
                $files += $fileObject
            }
        }
        $files = ConvertTo-Json $files
        New-Item .\info\AddedFiles.json -Value $files
    }
}


$deleteFolder = $root + 'delete'
$mediaIconFolder = $root + 'MediaIcons'

#Infinite loop
for ($true) {
    #Tries to go and retrieve the list of files, but if it does not exist, do nothing and wait...
    $addedFiles =$null
    try {
        [xml]$addedFiles = Get-Content ./info/NodeFileList.xml
    } catch{}
    $isToBeDeleted = Test-Path $deleteFolder
    if ($isToBeDeleted -eq $true) {
        Remove-Item $mediaIconFolder -Recurse -Force
        Rename-Item $deleteFolder -NewName $mediaIconFolder 
    }
    if ($addedFiles) {
        #if only one item, do logic for that item (Length property doesn't work when there is only one...)
        if (!$addedFiles.root.file.length) {
            write-host 'just 1 item'
            [System.Windows.Media.Imaging.BitmapSource] $iconSrc = [Microsoft.WindowsAPICodePack.Shell.ShellFile]::FromFilePath($addedFiles.root.file.path).Thumbnail.BitmapSource
            $srcMemoryStream = New-Object System.IO.MemoryStream
            $enc = New-Object System.Windows.Media.Imaging.BmpBitmapEncoder
            $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($iconSrc))
            $enc.Save($srcMemoryStream)
            $bitmap = New-Object System.Drawing.Bitmap($srcMemoryStream)
            $imgPath = 'E:\MediaIcons\' + $addedFiles.root.file.category + '-' + $addedFiles.root.file.name + $addedFiles.root.file.ext + '.bmp'
            $bitmap.Save($imgPath)
            $addedFiles.root.file.setAttribute('imgLoc', $imgPath)
            Update-List -fileList $addedFiles

        #Otherwise, if more than one file, go through each and do necessary steps...     
        } else {
            Write-Host 'more than 1 item'
            $addedFiles.root.file.length
            for ($i = 0; $i -lt $addedFiles.root.file.Length; $i++) {
                
                [System.Windows.Media.Imaging.BitmapSource] $iconSrc = [Microsoft.WindowsAPICodePack.Shell.ShellFile]::FromFilePath($addedFiles.root.file[$i].path).Thumbnail.BitmapSource
                $srcMemoryStream = New-Object System.IO.MemoryStream
                $enc = New-Object System.Windows.Media.Imaging.BmpBitmapEncoder
                $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($iconSrc))
                $enc.Save($srcMemoryStream)
                $bitmap = New-Object System.Drawing.Bitmap($srcMemoryStream)
                $imgPath = 'E:\MediaIcons\' + $addedFiles.root.file[$i].category + '-' + $addedFiles.root.file[$i].name + $addedFiles.root.file[$i].ext + '.bmp'
                $bitmap.Save($imgPath)
                $addedFiles.root.file[$i].setAttribute('imgLoc', $imgPath)
            }
            Update-List -fileList $addedFiles
        }

        #Removes file as the loop will keep doing this process if it still sees the file. Nodejs will create the file...
        Remove-Item './info/NodeFileList.xml'
    }
}



#create directory -Nodejs

#remove MediaIcons -Powershell
#create MediaIcons/rename created dir - Powershell