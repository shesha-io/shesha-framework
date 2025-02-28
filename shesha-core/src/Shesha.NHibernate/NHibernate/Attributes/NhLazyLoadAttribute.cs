using System;
using NHibernate.Cfg.MappingSchema;
using NHibernate.Mapping.ByCode;
using Shesha.Domain.Attributes;

namespace Shesha.NHibernate.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class NhLazyLoadAttribute : LazyLoadAttribute
    {
        public NhLazyLoadAttribute()
        {
            // NoProxy is used by default, see http://ayende.com/blog/4378/nhibernate-new-feature-no-proxy-associations
            Laziness = HbmLaziness.NoProxy;
        }

        public LazyRelation GetLazyRelation()
        {
            switch (Laziness)
            {
                case HbmLaziness.NoProxy:
                    return LazyRelation.NoProxy;
                case HbmLaziness.Proxy:
                    return LazyRelation.Proxy;
                case HbmLaziness.False:
                default:
                    return LazyRelation.NoLazy;
            }
        }

        public HbmLaziness Laziness { get; set; }
    }
}
