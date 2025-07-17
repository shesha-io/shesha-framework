# shesha-core-starter

A starter template with samples on how to build a shesha core app from scratch.

## License

Shesha and the various shesha community components and services are available under the [GPL-3.0 license](https://opensource.org/licenses/GPL-3.0). Shesha also includes external libraries that are available under a variety of licenses. See [LICENSE](https://github.com/boxfusion/shesha-core-starter/blob/HEAD/LICENSE) for the full license text.

## Running locally from CLI

*The working directory is shesha-core*  
shesha-core  
 |-- src  
 |-- nupkg  
 |-- .nuget  
 |-- test  
 |-- ...

### Build

> dotnet build

#### Build using provided scripts

##### Build on Linux/MacOS  

> ./build.sh  

##### Build on Windows PowerShell  

> ./build.bat

##### Build on Windows Command Prompt  

> build.bat  

### Run

> dotnet run --project src/Boxfusion.SheshaFunctionalTests.Web.Host --urls "<http://localhost:21021;https://localhost:44362>"

#### Run using provided scripts  

##### Run on Linux/MacOS  

> ./run.sh

##### Run on Windows PowerShell  

> ./run.bat

##### Run on Windows Command Prompt  

> run.bat

## Local development SSL certificate  

> [!NOTE]
> If you have do not have local certificate for SSL you will need to install the default development certificate and trust via:
>> dotnet dev-certs https --trust
