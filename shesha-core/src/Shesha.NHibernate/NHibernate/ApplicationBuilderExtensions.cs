using Microsoft.AspNetCore.Builder;
using Shesha.NHibernate.Middlewares;

namespace Shesha.NHibernate
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseNHibernateSessionPerRequest(this IApplicationBuilder app)
        {
            return app
                .UseMiddleware<NHibernateSessionPerRequestMiddleware>();
        }
    }
}
