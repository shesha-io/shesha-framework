# 2. Domain classes attributes

|  **Attribute**  | **Description** |
|--|--|
| `[Entity]` | Provides important parameters controlling how, and if, dynamic APIs should be generated for the entity. Also supports `TypeShortAlias` parameter. |
| `[Discriminator]` | This attribute applies on base classes whose subclasses inherit from. <br/> Example: Entities – Patient, Practitioner are all of type Person hence they would use the Person table on the database and a discriminator column to specify the type of Person(Patient, Practitioner) that is being referred to.|
| `[Table(“TableName”)]` | Specifies the database table that the entity data will be persisted to. |
| `[Audited]` | Identifies fields whose changes should be logged for easy tracking of when the change was made and the user responsible for that change. When used on the class level, all properties of that entity will be audited. |

# Properties Attributes

|  **Attribute**  | **Description** |
|--|--|
|`[Description(“Description of Property name”)]`  | Description of Class/Property Name. |
| `[Required]` | Used to specify fields that are mandatory for the user to enter, usually denoted by * on applications. |
| `[ReadonlyProperty]` | Identifies properties which Shesha should read from the database, but not attempt to update. This is typically used for properties based calculated columns at the database level.  |
| `[NotMapped]` | Identifies properties which Shesha should not attempt to map to the database. This is typically used for properties calculated at the application level. |
| `[StringLength(maxLength)] / [StringLength(minLength, maxLength)` | Used to specify a field length(in number of bytes required to store the string) that needs to be limited to maximum length or both minimum and maximum lengths. Its default parameter is maxLength and is used by properties with the _string_ data type. |
| `[ReferenceList(“ModuleName”, “RefListName”)]` | Used to denote properties of referencelist data type. |
| `[Audited]` | Identifies fields whose changes should be logged for easy tracking of when the change was made and the user responsible for that change. When used on the class level, all properties of that entity will be audited. |
| `[SaveAsJson]` | Applies to properties that reference child objects and causes them to be saved in the database as a Json string rather than as a regular entity. |
| `[CascadeUpdateRules]` | Applies to properties that reference other entities in order to specify if updates and creates actions should be cascaded to the referenced entity. |
| `[Encrypt]` | Identifies fields which should be persisted in the database as an encrypted string. 


# Sample Domain Entity Class with Attributes
### Example

```
using System;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [DiscriminatorValue("Shesha.Core.Address")]
    [Discriminator]
    [Entity(TypeShortAlias = "Shesha.Core.Address")]
    public class Address: FullAuditedEntity<Guid>
    {
        [ReferenceList("Shesha.Core", "AddressType")]
        public virtual int? AddressType { get; set; }

        [StringLength(200)]
        [Audited]
        public virtual string AddressLine1 { get; set; }

        [StringLength(200)]
        public virtual string AddressLine2 { get; set; }

        [StringLength(100)]
        public virtual string Suburb { get; set; }

        [StringLength(100)]
        public virtual string Town { get; set; }

        [StringLength(10)]
        public virtual string POBox { get; set; }

        [Range(-90, 90, ErrorMessage = "Latitude should be in range (-90, 90)")]
        public virtual decimal? Latitude { get; set; }

        [Range(-90, 90, ErrorMessage = "Longitude should be in range (-90, 90)")]
        public virtual decimal? Longitude { get; set; }

        [EntityDisplayName] 
        [ReadonlyProperty]
        public virtual string FullAddress { get; set; }

    }
}

```




