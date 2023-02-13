using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.NHibernate.Linq
{
    /// <summary>
    /// Shesha NHibernate  Linq extensions
    /// </summary>
    public static class SheshaNhibernateLinqExtensions
    {
        /// <summary>
        /// Convert referencelist item value to text using dbo.Frwk_GetRefListItem() stored function
        /// </summary>
        /// <param name="value">Value of the reference list item</param>
        /// <returns></returns>
        public static string AsReferenceListItemName<T>(this T value) where T : struct
        {
            throw new NotSupportedException();
        }

        /// <summary>
        /// Convert referencelist item value to text using dbo.Frwk_GetRefListItem() stored function
        /// </summary>
        /// <param name="value">Value of the reference list item</param>
        /// <returns></returns>
        public static string AsReferenceListItemName<T>(this T? value) where T : struct
        {
            throw new NotSupportedException();
        }
    }
}
