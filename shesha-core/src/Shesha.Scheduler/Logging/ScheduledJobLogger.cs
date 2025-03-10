﻿using System;
using System.Globalization;
using log4net;
using log4net.Core;
using log4net.Util;
using Shesha.Reflection;
using ILogger = Castle.Core.Logging.ILogger;

namespace Shesha.Scheduler.Logging
{
    [Serializable]
    public class ScheduledJobLogger :
        MarshalByRefObject,
        ILogger
    {
        private static readonly Type DeclaringType = typeof(ScheduledJobLogger);

        public ScheduledJobLogger(log4net.Core.ILogger logger, ScheduledJobLoggerFactory? factory)
        {
            Logger = logger;
            Factory = factory;
        }

        internal ScheduledJobLogger()
        {
        }

        internal ScheduledJobLogger(ILog log, ScheduledJobLoggerFactory? factory)
            : this(log.Logger, factory)
        {
        }

        public bool IsDebugEnabled => Logger.IsEnabledFor(Level.Debug);

        public bool IsErrorEnabled => Logger.IsEnabledFor(Level.Error);

        public bool IsFatalEnabled => Logger.IsEnabledFor(Level.Fatal);

        public bool IsInfoEnabled => Logger.IsEnabledFor(Level.Info);

        public bool IsWarnEnabled => Logger.IsEnabledFor(Level.Warn);

        protected internal ScheduledJobLoggerFactory? Factory { get; set; }

        protected internal log4net.Core.ILogger Logger { get; set; }

        public override string? ToString()
        {
            return Logger.ToString();
        }

        public virtual global::Castle.Core.Logging.ILogger CreateChildLogger(string name)
        {
            return Factory.NotNull().Create(Logger.Name + "." + name);
        }

        public void Trace(string message)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, message, null);
            }
        }

        public void Trace(Func<string> messageFactory)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, messageFactory.Invoke(), null);
            }
        }

        public void Trace(string message, Exception exception)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, message, exception);
            }
        }

        public void TraceFormat(string format, params object[] args)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void TraceFormat(Exception exception, string format, params object[] args)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void TraceFormat(IFormatProvider formatProvider, string format, params object[] args)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void TraceFormat(Exception exception, IFormatProvider formatProvider, string format, params object[] args)
        {
            if (IsTraceEnabled)
            {
                Logger.Log(DeclaringType, Level.Trace, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public void Debug(string message)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, message, null);
            }
        }

        public void Debug(Func<string> messageFactory)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, messageFactory.Invoke(), null);
            }
        }

        public void Debug(string message, Exception exception)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, message, exception);
            }
        }

        public void DebugFormat(string format, params Object[] args)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void DebugFormat(Exception exception, string format, params Object[] args)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), exception);
            }
        }

        public void DebugFormat(IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void DebugFormat(Exception exception, IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsDebugEnabled)
            {
                Logger.Log(DeclaringType, Level.Debug, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public void Error(string message)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, message, null);
            }
        }

        public void Error(Func<string> messageFactory)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, messageFactory.Invoke(), null);
            }
        }

        public void Error(string message, Exception exception)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, message, exception);
            }
        }

        public void ErrorFormat(string format, params Object[] args)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void ErrorFormat(Exception exception, string format, params Object[] args)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), exception);
            }
        }

        public void ErrorFormat(IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void ErrorFormat(Exception exception, IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsErrorEnabled)
            {
                Logger.Log(DeclaringType, Level.Error, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public void Fatal(string message)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, message, null);
            }
        }

        public void Fatal(Func<string> messageFactory)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, messageFactory.Invoke(), null);
            }
        }

        public void Fatal(string message, Exception exception)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, message, exception);
            }
        }

        public void FatalFormat(string format, params Object[] args)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void FatalFormat(Exception exception, string format, params Object[] args)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), exception);
            }
        }

        public void FatalFormat(IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void FatalFormat(Exception exception, IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsFatalEnabled)
            {
                Logger.Log(DeclaringType, Level.Fatal, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public void Info(string message)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, message, null);
            }
        }

        public void Info(Func<string> messageFactory)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, messageFactory.Invoke(), null);
            }
        }

        public void Info(string message, Exception exception)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, message, exception);
            }
        }

        public void InfoFormat(string format, params Object[] args)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void InfoFormat(Exception exception, string format, params Object[] args)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), exception);
            }
        }

        public void InfoFormat(IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void InfoFormat(Exception exception, IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsInfoEnabled)
            {
                Logger.Log(DeclaringType, Level.Info, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public void Warn(string message)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, message, null);
            }
        }

        public void Warn(Func<string> messageFactory)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, messageFactory.Invoke(), null);
            }
        }

        public void Warn(string message, Exception exception)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, message, exception);
            }
        }

        public void WarnFormat(string format, params Object[] args)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), null);
            }
        }

        public void WarnFormat(Exception exception, string format, params Object[] args)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, new SystemStringFormat(CultureInfo.InvariantCulture, format, args), exception);
            }
        }

        public void WarnFormat(IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, new SystemStringFormat(formatProvider, format, args), null);
            }
        }

        public void WarnFormat(Exception exception, IFormatProvider formatProvider, string format, params Object[] args)
        {
            if (IsWarnEnabled)
            {
                Logger.Log(DeclaringType, Level.Warn, new SystemStringFormat(formatProvider, format, args), exception);
            }
        }

        public bool IsTraceEnabled { get; }
    }
}
