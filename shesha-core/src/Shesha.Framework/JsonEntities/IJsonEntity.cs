using Newtonsoft.Json;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.JsonEntities
{
    public interface IJsonEntity: IHasClassNameField //, IHasDisplayNameField
    {
        string GetJson();
    }
}
