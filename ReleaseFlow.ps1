param(
    [string]$PipeBuildNumber,
    [string]$PipeSourceBranch,
    [string]$PipeSourceVersion,
    [string]$PipeTargetBranch,
    [string]$PipeBuildId    
)

write-host "The build number is: $PipeBuildNumber"
$numParts = "$PipeBuildNumber".Split('.')
$datePart = $numParts[0].PadLeft(8, '0')
$buildNoPart = $numParts[1].PadLeft(4, '0')
$patchNumber = $datePart + $buildNoPart


$buildNumber = "$PipeBuildNumber"
$parts = $buildNumber.Split('.')
$major = $parts[0].Substring(0,4)
$minor = $parts[0].Substring(4,2)
$patch = $parts[0].Substring(6,2)
$build = $parts[1]
$mainVersion = "0.0.$PipeBuildId" + "-build"

Write-Host "Version number for main: 0.0.$PipeBuildId"

write-host "The build number formatted is: $patchNumber"

write-host "The source branch is: $PipeSourceBranch"

write-host "This is the commit id using the pre-defined variable Build.SourceVersion: $PipeSourceVersion"
if ("$PipeSourceBranch" -like "*/pull/*"){
    write-host "Source Branch should be pull here: $PipeSourceBranch"
    write-host "Target Branch of the PR should be: $PipeTargetBranch"              

    if ("$PipeTargetBranch" -eq "main"){
        write-host "PR target is main branch. Setting currentBranch to refs/heads/main"  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/main"
        
        # git fetch --tags
        # $tag = git describe --tags $(git rev-list --tags --max-count=1 --no-walk $PipeSourceVersion)
        # Write-Host "Tag: $tag"

        write-host "##vso[task.setvariable variable=versionNo]$mainVersion"
    }
    elseif ("$PipeTargetBranch" -like "releases/*"){
        write-host "PR target is a release branch. Setting currentBranch to refs/heads/$PipeTargetBranch"                  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/$PipeTargetBranch"
        
        $path = "refs/heads/$PipeTargetBranch"
        $version = Split-Path $path -Leaf
        Write-Host $version

        write-host "##vso[task.setvariable variable=versionNo]$version.$build"
    }              
}  
elseif ("$PipeSourceBranch" -like "*/releases/*"){
    write-host "Source Branch should be releases here: $PipeSourceBranch"            
    write-host "##vso[task.setvariable variable=currentBranch]$PipeSourceBranch"

    $path = "$PipeSourceBranch"
    $version = Split-Path $path -Leaf
    Write-Host $version

    write-host "##vso[task.setvariable variable=versionNo]$version.$PipeBuildId"
}
elseif ("$PipeSourceBranch" -like "*/tags/release-*"){
    write-host "Source Branch should be tags here: $PipeSourceBranch"
    #$branch = Invoke-Expression "git branch -r --contains $(Build.SourceBranch)"

    $path = "$PipeSourceBranch"
    $version = Split-Path $path -Leaf
    Write-Host $version

    $releaseVersion = "$version".Replace("release-", "") + '.' + $PipeBuildId
    $releaseBranch = "refs/heads/releases/$releaseVersion"

    write-host "##vso[task.setvariable variable=currentBranch]$releaseBranch"
    write-host "##vso[task.setvariable variable=versionNo]$releaseVersion"
}
elseif ("$PipeSourceBranch" -like "*/main"){
   write-host "Source Branch should be main here: $PipeSourceBranch"
   write-host "##vso[task.setvariable variable=currentBranch]$PipeSourceBranch"
   write-host "##vso[task.setvariable variable=versionNo]$mainVersion"
}
