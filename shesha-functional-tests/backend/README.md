# shesha-core-starter
A starter template with samples on how to build a shesha core app from scratch.

### Build

> dotnet build

### Run

> dotnet run --project src/*.Web.Host --urls "<http://localhost:21021;https://localhost:44362>"

> [!NOTE]
> If you have do not have local certificate for SSL you will need to install the default development certificate and trust via:
>> dotnet dev-certs https --trust

## License

Shesha and the various shesha community components and services are available under the [GPL-3.0 license](https://opensource.org/licenses/GPL-3.0). Shesha also includes external libraries that are available under a variety of licenses. See [LICENSE](https://github.com/boxfusion/shesha-core-starter/blob/HEAD/LICENSE) for the full license text.
