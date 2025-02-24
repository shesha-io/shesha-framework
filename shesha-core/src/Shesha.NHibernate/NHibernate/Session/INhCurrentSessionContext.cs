using NHibernate;
using System;

namespace Shesha.NHibernate.Session
{
#nullable enable
    public interface INhCurrentSessionContext : IDisposable
    {
        /// <summary>
        /// 
        /// </summary>
        ISession Session { get; }
        ISession? SessionOrNull { get; }
    }
#nullable restore
}
