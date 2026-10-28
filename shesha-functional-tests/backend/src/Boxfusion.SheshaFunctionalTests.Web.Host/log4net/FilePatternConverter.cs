using log4net.Util;
using System;
using System.IO;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.log4net
{
    public class FilePatternConverter : PatternConverter
    {
        public override void Convert(TextWriter writer, object? state)
        {
            var host = Environment.GetEnvironmentVariable("COMPUTERNAME") ?? Environment.GetEnvironmentVariable("HOSTNAME");
            var filename = $"App_{host}.log";
            writer.Write(filename);
        }
    }
}
