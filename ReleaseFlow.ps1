# Write your PowerShell commands here.

if (-not $env:System_PullRequest_TargetBranch -and $env:System_PullRequest_TargetBranch) {
    $targetBranch = $env:System_PullRequest_TargetBranch
    Write-Host "Target branch: $targetBranch"
} else {
    Write-Host "Target branch is not available."
}

write-host "The build number is: $(Build.BuildNumber)"
write-host "The source branch is: $(Build.SourceBranch)"

write-host "This is the commit id using the pre-defined variable Build.SourceVersion: $(Build.SourceVersion)"
if ("$(Build.SourceBranch)" -like "*/pull/*"){
    write-host "Source Branch should be pull here: $(Build.SourceBranch)"
    write-host "Target Branch of the PR should be: $(System.PullRequest.TargetBranch)"              

    if ("$(System.PullRequest.TargetBranch)" -eq "main"){
        write-host "PR target is main branch. Setting currentBranch to refs/heads/main"  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/main"
        
        git fetch --tags
        $tag = git describe --tags $(git rev-list --tags --max-count=1 --no-walk $(Build.SourceVersion))
        Write-Host "Tag: $tag"

        write-host "##vso[task.setvariable variable=versionNo]$tag"
    }
    elseif ("$(System.PullRequest.TargetBranch)" -like "releases/*"){
        write-host "PR target is a release branch. Setting currentBranch to refs/heads/$(System.PullRequest.TargetBranch)"                  
        write-host "##vso[task.setvariable variable=currentBranch]refs/heads/$(System.PullRequest.TargetBranch)"
        
        $path = "refs/heads/$(System.PullRequest.TargetBranch)"
        $version = Split-Path $path -Leaf
        Write-Host $version

        write-host "##vso[task.setvariable variable=versionNo]$version"
    }              
}  
elseif ("$(Build.SourceBranch)" -like "*/releases/*"){
write-host "Source Branch should be releases here: $(Build.SourceBranch)"            
write-host "##vso[task.setvariable variable=currentBranch]$(Build.SourceBranch)"

$path = "$(Build.SourceBranch)"
$version = Split-Path $path -Leaf
Write-Host $version

write-host "##vso[task.setvariable variable=versionNo]$version"
}
elseif ("$(Build.SourceBranch)" -like "*/tags/release-*"){
    write-host "Source Branch should be tags here: $(Build.SourceBranch)"
    #$branch = Invoke-Expression "git branch -r --contains $(Build.SourceBranch)"

    $path = "$(Build.SourceBranch)"
    $version = Split-Path $path -Leaf
    Write-Host $version

    $releaseVersion = "$version".Replace("release-", "")
    $releaseBranch = "refs/heads/releases/$releaseVersion"

    write-host "##vso[task.setvariable variable=currentBranch]$releaseBranch"
    write-host "##vso[task.setvariable variable=versionNo]$releaseVersion"
}
# elseif ("$(Build.SourceBranch)" -like "*/main"){
#    write-host "Source Branch should be main here: $(Build.SourceBranch)"
#    write-host "##vso[task.setvariable variable=currentBranch]$(Build.SourceBranch)"
#    write-host "##vso[task.setvariable variable=versionNo]$(Build.BuildNumber)"
# }