using Shesha.EntityReferences;
using Shesha.Extensions;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Roles
{
    public class ShaRoleAppointmentData
    {
        public GenericEntityReference PermissionedEntity1 => PermissionedEntities.FirstOrDefault();
        public GenericEntityReference PermissionedEntity2 => PermissionedEntities.Skip(1).FirstOrDefault();
        public GenericEntityReference PermissionedEntity3 => PermissionedEntities.Skip(2).FirstOrDefault();

        public IList<GenericEntityReference> PermissionedEntities { get; internal set; } = new LimitedList<GenericEntityReference>(3);

        // ToDo: AS - check if we should add ShaRoleAppointmentEntity or delete it
        // https://teams.microsoft.com/l/message/19:4472ec569587404b8fb82b3ee2caf701@thread.tacv2/1722962818684?tenantId=6017f842-b494-4e2c-a7be-93814b44805a&groupId=18f8ff2a-ca19-4167-9b21-2a7bc42dc6f9&parentMessageId=1721987908916&teamName=Shesha&channelName=Web%20Framework%20Devs&createdTime=1722962818684
        //public List<IEntity<Guid>> Entities { get; set; }
    }
}
