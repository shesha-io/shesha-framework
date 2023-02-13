using System;
using System.IO;
using System.Xml;
using Abp.Reflection.Extensions;
using Castle.Core.Logging;
using log4net;
using log4net.Config;
using log4net.Repository;

namespace Shesha.Scheduler.Logging
{
    public class ScheduledJobLoggerFactory : AbstractLoggerFactory
    {
        internal const string DefaultConfigFileName = "log4net.config";
        private readonly ILoggerRepository _loggerRepository;

        public ScheduledJobLoggerFactory()
            : this(DefaultConfigFileName)
        {
        }

        public ScheduledJobLoggerFactory(string configFileName)
        {
            _loggerRepository = LogManager.CreateRepository(
                typeof(ScheduledJobLoggerFactory).GetAssembly(),
                typeof(log4net.Repository.Hierarchy.Hierarchy)
            );

            var log4NetConfig = new XmlDocument();
            log4NetConfig.Load(File.OpenRead(configFileName));
            XmlConfigurator.Configure(_loggerRepository, log4NetConfig["log4net"]);
        }

        public ScheduledJobLoggerFactory(string configFileName, bool reloadOnChange)
        {
            _loggerRepository = LogManager.CreateRepository(
                typeof(ScheduledJobLoggerFactory).GetAssembly(),
                typeof(log4net.Repository.Hierarchy.Hierarchy)
            );

            if (reloadOnChange)
            {
                XmlConfigurator.ConfigureAndWatch(_loggerRepository, new FileInfo(configFileName));
            }
            else
            {
                var log4NetConfig = new XmlDocument();
                log4NetConfig.Load(File.OpenRead(configFileName));
                XmlConfigurator.Configure(_loggerRepository, log4NetConfig["log4net"]);
            }
        }

        public override ILogger Create(string name)
        {
            if (name == null)
            {
                throw new ArgumentNullException(nameof(name));
            }

            return new ScheduledJobLogger(LogManager.GetLogger(_loggerRepository.Name, name), this);
        }

        public override ILogger Create(string name, LoggerLevel level)
        {
            throw new NotSupportedException("Logger levels cannot be set at runtime. Please review your configuration file.");
        }
    }
}
