param(
    [string]$PipeBuildNumber,
    [string]$PipeSourceBranch,
    [string]$PipeSourceVersion,
    [string]$PipeTargetBranch
)

write-host "The build number is: $PipeBuildNumber"
write-host "The source branch is: $PipeSourceBranch"

write-host "This is the commit id using the pre-defined variable Build.SourceVersion: $PipeSourceVersion"
if ("$PipeSourceBranch" -like "*/pull/*"){
    write-host "Source Branch should be pull here: $PipeSourceBranch"
    write-host "Target Branch of the PR should be: $PipeTargetBranch"              

    if ("$PipeTargetBranch" -eq "main"){
        write-host "PR target is main branch. Setting currentBranch to refs/heads/main"  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/main"
        
        git fetch --tags
        # $tag = git describe --tags $(git rev-list --tags --max-count=1 --no-walk $PipeSourceVersion)
        $tag = git describe --tags $(git rev-list --tags --max-count=1 --no-walk)        
        Write-Host "Tag: $tag"

        write-host "##vso[task.setvariable variable=versionNo]$tag"
    }
    elseif ("$PipeTargetBranch" -like "releases/*"){
        write-host "PR target is a release branch. Setting currentBranch to refs/heads/$PipeTargetBranch"                  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/$PipeTargetBranch"
        
        $path = "refs/heads/$PipeTargetBranch"
        $version = Split-Path $path -Leaf
        Write-Host $version

        write-host "##vso[task.setvariable variable=versionNo]$version"
    }              
}  
elseif ("$PipeSourceBranch" -like "*/releases/*"){
    write-host "Source Branch should be releases here: $PipeSourceBranch"            
    write-host "##vso[task.setvariable variable=currentBranch]$PipeSourceBranch"

    $path = "$PipeSourceBranch"
    $version = Split-Path $path -Leaf
    Write-Host $version

    write-host "##vso[task.setvariable variable=versionNo]$version.$build""
}
elseif ("$PipeSourceBranch" -like "*/tags/release-*"){
    write-host "Source Branch should be tags here: $PipeSourceBranch"
    #$branch = Invoke-Expression "git branch -r --contains $(Build.SourceBranch)"

    $path = "$PipeSourceBranch"
    $version = Split-Path $path -Leaf
    Write-Host $version

    $releaseVersion = "$version".Replace("release-", "")
    $releaseBranch = "refs/heads/releases/$releaseVersion"

    write-host "##vso[task.setvariable variable=currentBranch]$releaseBranch"
    write-host "##vso[task.setvariable variable=versionNo]$releaseVersion"
}
elseif ("$PipeSourceBranch" -like "*/main"){
   write-host "Source Branch should be main here: $PipeSourceBranch"
   write-host "##vso[task.setvariable variable=currentBranch]$PipeSourceBranch"
   write-host "##vso[task.setvariable variable=versionNo]$PipeBuildNumber"
}
