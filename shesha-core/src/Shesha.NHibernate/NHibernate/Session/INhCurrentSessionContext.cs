using NHibernate;
using System;

namespace Shesha.NHibernate.Session
{
    public interface INhCurrentSessionContext : IDisposable
    {
        /// <summary>
        /// 
        /// </summary>
        ISession Session { get; }
        ISession? SessionOrNull { get; }
    }
}
