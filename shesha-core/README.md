shesha-core
========================


[![docs](https://badgen.net/badge/docs/Shesha/latest?version=latest)](https://docs.shesha.io/docs/get-started/Introduction)

## License

Shesha and the various shesha community components and services are available under the [Apache License 2.0](../LICENSE.md). Shesha also includes external libraries that are available under a variety of licenses. See [LICENSE.md](../LICENSE.md) for the full license text.

## Running locally from CLI:

*The working directory is shesha-core*  
shesha-core  
 |-- src  
 |-- nupkg  
 |-- .nuget  
 |-- test  
 |-- ...

### Build

> dotnet build 

### Run

> dotnet run --project src/Shesha.Web.Host --urls "http://localhost:21021;https://localhost:44362"

> [!NOTE]
> If you have do not have local certificate for SSL you will need to install the default development certificate and trust via:
>> dotnet dev-certs https --trust
