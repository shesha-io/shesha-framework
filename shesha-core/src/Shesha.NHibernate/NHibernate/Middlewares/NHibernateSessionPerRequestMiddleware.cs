using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Http;
using NHibernate;
using Shesha.NHibernate.Session;
using ISession = NHibernate.ISession;

namespace Shesha.NHibernate.Middlewares
{
    public class NHibernateSessionPerRequestMiddleware
    {
        private readonly ILogger _logger;
        private readonly IIocResolver _iocResolver;

        private readonly RequestDelegate _next;

        public NHibernateSessionPerRequestMiddleware(RequestDelegate next, IIocResolver iocResolver)
        {
            _next = next;
            _iocResolver = iocResolver;

            _logger = NullLogger.Instance;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            // begin request - bind
            BindLazySession();

            await _next.Invoke(httpContext);

            // end request - unbind
            UnbindLazySessions();
        }

        public void BindLazySession()
        {
            try
            {
                _logger.Debug("bind lazy NH session");

                foreach (var sessionFactory in GetSessionFactories())
                {
                    var localFactory = sessionFactory;

                    LazySessionContext.Bind(new Lazy<ISession>(() => BeginSession(localFactory, _logger)), sessionFactory);
                }

            }
            catch (Exception ex)
            {
                _logger.Fatal($"bind lazy session failed", ex);
                throw;
            }
        }

        /// <summary>
        /// Bind lazy NHibernate sessions for all session factories
        /// </summary>
        private static ISession BeginSession(ISessionFactory sessionFactory, ILogger logger)
        {
            try
            {
                logger.DebugFormat("start lazy NH session");

                var session = sessionFactory.OpenSession(); // AbpNHibernateInterceptor installed globally in the start of AbpNHibernateModule
                session.BeginTransaction();

                logger.Debug($"NH session started: {session.GetId()}");

                return session;
            }
            catch (Exception ex)
            {
                logger.Error("failed to start NH session", ex);
                throw new SessionStartException("BeginSession failed", ex);
            }
        }

        /// <summary>
        /// Unbind all lazy NHibernate sessions
        /// </summary>
        private void UnbindLazySessions()
        {
            try
            {
                _logger.Debug("Unbind all NH lazy sessions");
                foreach (var sessionFactory in GetSessionFactories())
                {
                    var session = LazySessionContext.UnBind(sessionFactory);
                    if (session == null)
                    {
                        _logger.Debug($"lazy NH session is null");
                        continue;
                    }
                    _logger.Debug($"lazy NH session has been unbound: {session.GetId()}");

                    session.EndSession();
                }
                _logger.Debug("All lazy NH sessions have been unbound");
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to unbind lazy NH sessions", ex);
                throw;
            }
        }


        /// <summary>
        /// Retrieves all ISessionFactory instances via IoC
        /// </summary>
        private IEnumerable<ISessionFactory> GetSessionFactories()
        {
            var sessionFactories = _iocResolver.ResolveAll<ISessionFactory>();

            if (sessionFactories == null || !sessionFactories.Any())
                throw new TypeLoadException($"At least one {nameof(ISessionFactory)} has not been registered with IoC");

            return sessionFactories;
        }
    }
}
