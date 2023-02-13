using NHibernate.Linq.Functions;

namespace Shesha.NHibernate.Linq
{
    /// <summary>
    /// Shesha Linq to HQL generator registry. Extends NHibernate linq
    /// </summary>
    public class SheshaLinqToHqlGeneratorsRegistry : DefaultLinqToHqlGeneratorsRegistry
    {
        public SheshaLinqToHqlGeneratorsRegistry()
            : base()
        {
            this.Merge(new AsReferenceListItemNameGenerator());
        }
    }
}
