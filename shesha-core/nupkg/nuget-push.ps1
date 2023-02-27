$key = $env:boxfusion_nuget_apikey
if ($key) {
	Write-Output "API KEY found"
	$packages = Get-ChildItem -Recurse packages\*.nupkg
	foreach ($pkg in $packages) {
		..\.nuget\nuget push $pkg.FullName -source https://nuget.org/api/v2/package -apikey $key
	}
} else {
	Write-Output "API KEY not found!"
}