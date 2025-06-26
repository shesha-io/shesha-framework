using Newtonsoft.Json;
using Shesha.NHibernate.UserTypes;
using Xunit;

namespace Shesha.Tests.DomainAttributes
{
    public class JsonUserType_Tests
    {
        [Fact]
        public void Should_Assemble()
        {
            var person = new PersonEntity
            {
                Name = "Someone special",
                HomeAddress = new Address
                {
                    Street = "24 Fitter Rd",
                    Town = "Cresslawn",
                    PostalCode = 1619
                }
            };
            var jsonifiedPerson = JsonConvert.SerializeObject(person);

            var userType = new JsonUserType<PersonEntity>();
            var deserialized = userType.Assemble(jsonifiedPerson, null) as PersonEntity;

            Assert.NotNull(deserialized);            
            Assert.Equal(person.Name, deserialized.Name);
            Assert.Equal(person.HomeAddress.Street, deserialized.HomeAddress.Street);
            Assert.Equal(person.HomeAddress.PostalCode, deserialized.HomeAddress.PostalCode);
            Assert.Equal(person.HomeAddress.Coordinates, deserialized.HomeAddress.Coordinates);
        }

        [Fact]
        public void Should_Disassemble()
        {
            var person = new PersonEntity
            {
                Name = "Someone special",
                HomeAddress = new Address
                {
                    Street = "24 Fitter Rd",
                    Town = "Cresslawn",
                    PostalCode = 1619
                }
            };

            var userType = new JsonUserType<PersonEntity>();
            var serialized = userType.Disassemble(person);

            Assert.NotNull(serialized);
            Assert.IsType<string>(serialized);
            Assert.Contains("street", serialized.ToString());
        }
    }
}
