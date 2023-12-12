using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Table("SheshaFunctionalTests_Drivers")]
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Drivers")]
    public class Driver : Entity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        [SaveAsJson]
        public virtual JsonCar MainCar { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [SaveAsJson]
        public virtual IList<JsonCar> OtherCars { get; set; }
    }
}
