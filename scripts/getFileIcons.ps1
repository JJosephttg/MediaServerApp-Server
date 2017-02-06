cd D:/Dev/MediaAppServer/API/scripts

Add-Type -AssemblyName System.Drawing


#Create json with files, and execute the python script to let it know that there are some files that need to be processed.
function callPYScript($files) {
    $fileName = './info/pyList.json'
    $jsonlist = @()
    
    foreach ($file in $files) {
        $obj = New-Object -TypeName PSObject
        Add-Member -InputObject $obj -MemberType NoteProperty -Name name -Value $file.name -Force
        Add-Member -InputObject $obj -MemberType NoteProperty -Name category -Value $file.category -Force
        Add-Member -InputObject $obj -MemberType NoteProperty -Name path -Value $file.path -Force
        Add-Member -InputObject $obj -MemberType NoteProperty -Name ext -Value $file.ext -Force
        $obj       
        $jsonlist += $obj
    }
    New-Item $fileName -Force
    Set-Content $fileName -value ($jsonlist | ConvertTo-Json)
    ./getIcons.py

}



#Infinite loop
#for ($true) {
    #Tries to go and retrieve the list of files, but if it does not exist, do nothing and wait...
    try {
        [xml]$addedFiles = Get-Content ./info/NodeFileList.xml
    } catch{}
    #If file exists, go ahead and sort through and divide up the work so that each file type can be dealt with effectively
    if ($addedFiles) {

        $fileIconList = @()
        $videoIconList = @()
        $imageIconList = @()
        
        if ($addedFiles.root.file.path) {
            $addedFiles.root.file.ext
            if ($addedFiles.root.file.ext.ToLower() -in ('.jpg', '.png', '.bmp', '.jpeg')) {
               
                $imageIconList += $addedFiles.root.file
            }
            elseif ($addedFiles.root.file.ext.ToLower() -in ('.avi', '.flv', '.m1v', '.m2v', '.mp4', '.mpg', '.mpeg', '.wmv', '.3gp')) {
                $videoIconList += $addedFiles.root.file
            }
            else {$fileIconList += $addedFiles.root.file}
        }
        for($i = 0; $i -lt $addedFiles.root.file.length; $i++) {
            
            $addedFiles.root.file[$i].ext
            if ($addedFiles.root.file[$i].ext.ToLower() -in ('.jpg', '.png', '.bmp', '.jpeg')) {
                
                $imageIconList += $addedFiles.root.file[$i]
            }
            elseif ($addedFiles.root.file[$i].ext.ToLower() -in ('.avi', '.flv', '.m1v', '.m2v', '.mp4', '.mpg', '.mpeg', '.wmv', '.3gp')) {
                
                $videoIconList += $addedFiles.root.file[$i]
            }
            else {$fileIconList += $addedFiles.root.file[$i]}
        }
            if ($fileIconList) {
            #Process for getting the icon from unknown or common file type (Non image or video)
                for ($i = 0; $i -lt $fileIconList.length; $i++) {
                    $Path = $addedFiles.root.file[$i].path

                    $Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($Path)

                    $MemoryStream = New-Object System.IO.MemoryStream
                    $Icon.save($MemoryStream)
                    $Bytes = $MemoryStream.ToArray()
                    $MemoryStream.Flush()
                    $MemoryStream.Dispose()
                    $iconB64 = [convert]::ToBase64String($Bytes)
                    $fileIconList[$i].setAttribute('imgString', $iconB64)
                }
            }

        #To be as effective as possible, only do the processes if the associated type of files exist and need icons.
        if ($imageIconList -or $videoIconList) {
            if ($imageIconList -and $videoIconList) {
                foreach ($file in $imageIconList) {
                    write-host 'uh.. what?'
                    $videoIconList += $file
                }
                $combinedList = $videoIconList 
                callPYScript -files $combinedList
            }
            elseif ($imageIconList) {
                write-host 'hey wtf man...'
                callPYScript -files $imageIconList
            }
            elseif ($videoIconList) {
                write-host 'hey it works'
                callPYScript -files $videoIconList
                
            }
        } elseif (!$imageIconList -and !$videoIconList) {
            $jsonlist = @()
    
            foreach ($file in $fileIconList) {
                $obj = New-Object -TypeName PSObject
                Add-Member -InputObject $obj -MemberType NoteProperty -Name name -Value $file.name -Force
                Add-Member -InputObject $obj -MemberType NoteProperty -Name category -Value $file.category -Force
                Add-Member -InputObject $obj -MemberType NoteProperty -Name path -Value $file.path -Force
                Add-Member -InputObject $obj -MemberType NoteProperty -Name ext -Value $file.ext -Force
                Add-Member -InputObject $obj -MemberType NoteProperty -Name imgString -Value $file.imgString -Force
                $obj       
                $jsonlist += $obj
            }
            New-Item ./info/AddedFiles.json -Force
            Set-Content ./info/AddedFiles.json -value ($jsonlist | ConvertTo-Json)
        } 
        #Removes file as the loop will keep doing this process if it still sees the file. Nodejs will create the file...
        #Remove-Item 'NodeFileList.xml'
    }
#}



