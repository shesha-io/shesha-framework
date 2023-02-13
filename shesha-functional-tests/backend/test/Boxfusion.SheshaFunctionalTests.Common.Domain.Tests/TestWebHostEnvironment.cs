using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace Boxfusion.SheshaFunctionalTests.Common.Tests
{
    public class TestWebHostEnvironment: IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Test Application";
        public string WebRootPath { get; set; } = Path.Combine(Environment.CurrentDirectory, "wwwroot");
        public string EnvironmentName { get; set; } = "Test";
        public string ContentRootPath { get; set; } = Environment.CurrentDirectory;

        public IFileProvider ContentRootFileProvider
        {
            get => throw new NotImplementedException();
            set => throw new NotImplementedException();
        }

        public IFileProvider WebRootFileProvider
        {
            get => throw new NotImplementedException();
            set => throw new NotImplementedException();
        }
    }
}
