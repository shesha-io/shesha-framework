using System;
using System.IO;
using log4net.Util;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.log4net
{
    public class FilePatternConverter : PatternConverter
    {
        protected override void Convert(TextWriter writer, object state)
        {
            var host = Environment.GetEnvironmentVariable("COMPUTERNAME") ?? Environment.GetEnvironmentVariable("HOSTNAME");
            var filename = $"App_{host}.log";
            writer.Write(filename);
        }
    }
}
