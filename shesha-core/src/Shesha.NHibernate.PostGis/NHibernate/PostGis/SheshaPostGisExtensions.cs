using NHibernate.Engine;
using NHibernate.Spatial.Dialect;
using NHibernate.Spatial.Metadata;
using Shesha.NHibernate.Configuration;

namespace Shesha.NHibernate.PostGis
{
    public static class SheshaPostGisExtensions
    {
        public static IShaNHibernateModuleConfiguration UsePostGis(this IShaNHibernateModuleConfiguration nhConfig) 
        {
            // todo: check current DBMS type
            nhConfig.UseDialect<PostGis20Dialect>();

            nhConfig.UseCustomSessionFactoryBuilder(cfg => {

                var sessionFactory = cfg.BuildSessionFactory();
                var spatialDialect = (ISpatialDialect)((ISessionFactoryImplementor)sessionFactory).Dialect;
                if (spatialDialect != null)
                {
                    var supportedMetadataClasses = Enum.GetValues(typeof(MetadataClass)).Cast<MetadataClass>().Where(c => spatialDialect.SupportsSpatialMetadata(c)).ToList();
                    foreach (var metadataClass in supportedMetadataClasses)
                    {
                        global::NHibernate.Spatial.Metadata.Metadata.AddMapping(cfg, metadataClass);
                    }
                            
                    // rebuild session factory if mapping were changed
                    if (supportedMetadataClasses.Any())
                        sessionFactory = cfg.BuildSessionFactory();
                }

                return sessionFactory;
            });

            return nhConfig;
        }
    }
}
