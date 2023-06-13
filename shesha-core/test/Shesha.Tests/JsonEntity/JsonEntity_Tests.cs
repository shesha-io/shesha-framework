using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.DynamicProxy;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NHibernate.Linq;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.MappingMetadata;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Binder;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities.Proxy;
using Shesha.NHibernate.UoW;
using Shesha.Services;
using Shesha.Web.Core._Test;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonEntity
{
    public class JsonEntity_Tests : SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<Organisation, Guid> _organisationRepository;
        private readonly IRepository<ComplexTest, Guid> _jsonRepository;
        private readonly IRepository<ComplexTestString, Guid> _jsonStringRepository;
        //private readonly IRepository<ComplexPersonTest, Guid> _jsonPersonRepository;
        private readonly IEntityModelBinder _entityModelBinder;
        private readonly ITypeFinder _typeFinder;
        private readonly IDynamicRepository _dynamicRepository;

        public JsonEntity_Tests()
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _organisationRepository = Resolve<IRepository<Organisation, Guid>>();
            _jsonRepository = Resolve<IRepository<ComplexTest, Guid>>();
            _jsonStringRepository = Resolve<IRepository<ComplexTestString, Guid>>();
            //_jsonPersonRepository = Resolve<IRepository<ComplexPersonTest, Guid>>();
            _entityModelBinder = Resolve<IEntityModelBinder>();
            _typeFinder = Resolve<ITypeFinder>();
            _dynamicRepository = Resolve<IDynamicRepository>();
        }

        public class Shurik
        {
            public virtual string Name { get; set; }
            public string Test { get; set; }
        }

        public class MyJsonEntity
        {
            public virtual string Name { get; set; }
            public virtual Person Person { get; set; }
        }

        [Table("Test_ComplexTest")]
        public class ComplexTestString : Entity<Guid>
        {
            public virtual string Name { get; set; }
            public virtual string Description { get; set; }
            public virtual Person Person { get; set; }

            public virtual string JsonList { get; set; }

            public virtual string JsonPerson { get; set; }

            public virtual string AnyJson { get; set; }
        }

        public class TestInt
        {
            public int I { get; set; }
            public Int64? Ii { get; set; }
        }

        [Fact]
        public async Task GetAllJsonProperties()
        {
            LoginAsHostAdmin();

            using var uow = (NhUnitOfWork)_unitOfWorkManager.Begin();

            var session = uow.GetSession();

            var oldValue = "Shesha.Test.JsonPerson1";
            var newValue = "Shesha.Test.JsonPerson";

            var entityTypes = _typeFinder.FindAll().Where(t => t.IsEntityType()).ToList();

            var mapProvider = Resolve<IMappingMetadataProvider>();

            foreach (var entityType in entityTypes)
            {
                try
                {
                    var jsonProps = entityType.GetProperties().Where(x => x.PropertyType.IsJsonEntityType()).ToList();
                    var genericProps = entityType.GetProperties().Where(x => x.PropertyType == typeof(GenericEntityReference)).ToList();
                    if (jsonProps.Any())
                        await mapProvider.UpdateClassNames(entityType, jsonProps, oldValue, newValue, true);
                    if (genericProps.Any())
                        await mapProvider.UpdateClassNames(entityType, genericProps, oldValue, newValue, false);
                }
                catch (Exception)
                {
                }
            }
        }

        [Fact]
        public async Task GetJsonEntity()
        {
            var i = new TestInt();

            i.I = 1111;
            i.Ii = 2222;

            i.Ii = i.I;

            var pi = i.GetType().GetProperty("I");
            var pii = i.GetType().GetProperty("Ii");

            pii.SetValue(i, Convert.ToInt64(pi.GetValue(i)));
            pii.SetValue(i, Convert.ChangeType(pi.GetValue(i), typeof(Int64?)));
            pii.SetValue(i, pi.GetValue(i));


            var p = pii.PropertyType == typeof(Int64?);
            var pp = pii.PropertyType.Equals(typeof(Int64?));
            var ppp = pii.PropertyType == Nullable.GetUnderlyingType(typeof(long?));

            var iii = pi.GetValue(i);// Convert.ChangeType(pi.GetValue(i), Nullable.GetUnderlyingType(typeof(long?)));
            pii.SetValue(i, iii);

            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var obj = _jsonRepository.Get(Guid.Parse("FB57A090-6FDC-452C-8945-9356377271B9"));

                var fn = obj.JsonPerson.FirstName;

                var fn1 = (obj.JsonList[0] as JsonAddress).Town;

                var slist = await _jsonStringRepository.GetAll().Take(25).ToListAsync();

                var list = await _jsonRepository.GetAll().Take(25).ToListAsync();

                var persList = await _personRepository.GetAll().Take(25).ToListAsync();
            }
        }

        [Fact]
        public async Task GetUpdate()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var obj = _jsonRepository.Get(Guid.Parse("FB57A090-6FDC-452C-8945-9356377271B9"));
                await _jsonRepository.InsertOrUpdateAsync(obj);
            }
        }

        [Fact]
        public void CheckEmptyJsonEntity()
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var person = _personRepository.GetAll().FirstOrDefault();

                var json = @"
{
    ""id"":""03AD51DD-DC1B-4E93-B255-C05641D97411"",
    ""name"":""New Person test"",
    ""description"":""New Person Description"",
    ""jsonPerson"":{
        ""person"":{""id"":""B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"", ""displayText"":""Shurikan""},
        ""firstName"":""11111"",
        ""lastName"":""22222"",
        ""address"":{""town"":""jsonPerson Town"",""street"":""jsonPerson street"",""postalCode"":12345678,""_meta"":{""className"":""Shesha.Test.JsonAddress""}},
        ""_meta"":{""className"":""Shesha.Test.JsonPerson""}},
    ""any"":{""town"":""My Town"",""street"":""My street"",""postalCode"":12345678,""_meta"":{""className"":""Shesha.Test.JsonAddress""}}
}
";
                var complex = JsonConvert.DeserializeObject<ComplexTest>(json);

                var jsonRes = JsonEntityProxy.GetJson(complex.JsonPerson).ToString();

                var b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                var i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                var tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                var fn = complex.JsonPerson.FirstName;

                b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                var ja = complex.JsonPerson.Address;

                b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                var jat = complex.JsonPerson.Address?.Town;

                b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                complex.JsonPerson.Person = person;

                jsonRes = JsonEntityProxy.GetJson(complex.JsonPerson).ToString();

                b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                complex.JsonPerson.Address.Town = "Test town";

                jsonRes = JsonEntityProxy.GetJson(complex.JsonPerson).ToString();

                b = JsonEntityProxy.IsChanged(complex.JsonPerson as IJsonEntityProxy);
                i = (complex.JsonPerson as IJsonEntityProxy)._isInitialized;
                tc = (complex.JsonPerson as IJsonEntityProxy)._isThisChanged;

                jsonRes = JsonEntityProxy.GetJson(complex).ToString();

            }
        }

        [Fact]
        public async Task ObjectToJson()
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var person = _personRepository.GetAll().FirstOrDefault();

                var o = new ComplexTest()
                {
                    Name = "New Person test",
                    Description = "New Person Description",
                    Person = person,

                    JsonList = new List<JsonEntities.JsonEntity>()
                    {
                        new JsonAddress() { Town = "Listed Town", Street = "Listed street" },
                        new JsonPerson() { FirstName = "11", LastName = "qq" },
                        new JsonPerson() { FirstName = "22", LastName = "ww" },
                        new JsonPerson() { FirstName = "33", LastName = "ee" },
                    },

                    AnyJson = new JsonAddress()
                    {
                        Town = "My Town",
                        Street = "My street",
                        PostalCode = 12345678
                    },

                    JsonPerson = new JsonPerson()
                    {
                        FirstName = "11111",
                        LastName = "22222",
                        Person = person,
                    }
                };

                var dto = await EntityToDtoModelExtesions.MapToCustomDynamicDtoAsync<ComplexTestDto, ComplexTest, Guid>(o);


                var jObj = new JObject();
                ObjectToJsonExtension.ObjectToJObject(dto, jObj);

                dto.JsonPerson.FirstName = "Shurik";
                dto.Description = "+++++++";
                (dto.JsonList[3] as JsonPerson).FirstName = "Trheeeeeee";

                ObjectToJsonExtension.ObjectToJObject(dto, jObj);
            }
        }

        [Fact]
        public void Proxy()
        {
            var obj = new Shurik() { Name = "Shurik", Test = "+++" };
            var mixin = new JsonReference() { _displayName = "Test" };

            var p = new ProxyGenerationOptions();
            p.AddMixinInstance(mixin);

            var model1 = (Shurik)new ProxyGenerator().CreateClassProxyWithTarget(obj.GetType(), /*new[] { typeof(IInner) },*/ obj, p);

            var b = ProxyUtil.IsProxy(model1);
            b = ProxyUtil.IsProxy(obj);

            const System.Reflection.BindingFlags flags = System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance;
            var proxyType = model1.GetType();
            var instanceField = proxyType.GetField("__target", flags);
            var unproxy = instanceField?.GetValue(model1);

            var s1 = (model1 as IJsonReference)._displayName;
            model1.Test = "===";
            var s2 = model1.Test;

            mixin._displayName = "!!!";

            var model2 = new ProxyGenerator().CreateClassProxyWithTarget(obj.GetType(), /*new[] { typeof(IInner) },*/ obj, p);

            (model1 as IJsonReference)._displayName = "111";
            (model2 as IJsonReference)._displayName = "222";

            var s = (model1 as IJsonReference)._displayName;
        }

        [Fact]
        public async Task BindModelToDto()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin())
            {
                var person = _personRepository.GetAll().FirstOrDefault();

                var json = @"
{
    ""id"":""03AD51DD-DC1B-4E93-B255-C05641D97411"",
    ""name"":""New Person test"",
    ""description"":""New Person Description"",
    ""jsonPerson"":{
        ""person"":{""id"":""B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"", ""displayText"":""Shurikan""},
        ""firstName"":""11111"",
        ""lastName"":""22222"",
        ""_meta"":{""className"":""Shesha.Test.JsonPerson""}},
    ""jsonList"":[
        {""town"":""Listed Town"",""street"":""Listed street"",""postalCode"":0,""_meta"":{""className"":""Shesha.Test.JsonAddress""}},
        {""person"":null,""firstName"":""11"",""lastName"":""qq"",""_meta"":{""className"":""Shesha.Test.JsonPerson""}},
        {""person"":null,""firstName"":""22"",""lastName"":""ww"",""_meta"":{""className"":""Shesha.Test.JsonPerson""}},
        {""person"":null,""firstName"":""33"",""lastName"":""ee"",""_meta"":{""className"":""Shesha.Test.JsonPerson""}}],
    ""any"":{""town"":""My Town"",""street"":""My street"",""postalCode"":12345678,""_meta"":{""className"":""Shesha.Test.JsonAddress""}}
}
";
                var complex = JsonConvert.DeserializeObject<ComplexTest>(json);

                var json2 = JsonConvert.SerializeObject(complex);

                var name = complex.JsonPerson?.FirstName;

                var pp = complex.JsonPerson.Person;

                var json3 = JsonConvert.SerializeObject(complex);

                var jObject1 = JObject.Parse(json);
                var testErrors1 = new List<ValidationResult>();
                var obj = new ComplexTest();
                var testResult1 = await _entityModelBinder.BindPropertiesAsync(jObject1, obj, new EntityModelBindingContext());
            }
        }

        [Fact]
        public void DeserializeAny()
        {
            var json = "{\"person\":null,\"firstName\":\"AnyJson first name\",\"lastName\":\"AnyJson last name\",\"_meta\":{\"className\":\"Shesha.Test.JsonPerson\"}}";
            var obj = JsonConvert.DeserializeObject<Shesha.JsonEntities.IJsonEntity>(json);
            var s = JsonConvert.SerializeObject(obj);
            Assert.Equal(s, json);
        }

        [Fact]
        public void DeserializeAnyFailed()
        {
            try
            {
                var json = "{\"person\":null,\"firstName\":\"AnyJson first name\",\"lastName\":\"AnyJson last name\",\"_meta\":{\"className\":\"Shesha.Test.JsonPerson\"}}";
                // use JsonEntity instead of IJsonEntity
                var obj = JsonConvert.DeserializeObject<Shesha.JsonEntities.JsonEntity>(json);
            }
            catch
            {
            }
        }

        [Fact]
        public async Task CreateJsonEntity()
        {
            for (var i = 0; i < 1000; i++)
            {
                var o = new ComplexTest()
                {
                    Name = $"{300 + i} JsonEntity Person test",
                    Description = "{i}  New Person Description",
                    JsonList = new List<JsonEntities.JsonEntity>()
                {
                    new JsonAddress() { Town = "Listed Town", Street = "Listed street" },
                    new JsonPerson() { FirstName = "11", LastName = "qq" },
                    new JsonPerson() { FirstName = "22", LastName = "ww" },
                    new JsonPerson() { FirstName = "33", LastName = "ee" },
                },
                    AnyJson = new JsonPerson()
                    {
                        FirstName = "JsonEntity",
                        LastName = "JsonEntity",
                        Person = _personRepository.Get(Guid.Parse("B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"))
                    },
                    JsonPerson = new JsonPerson()
                    {
                        FirstName = "11111",
                        LastName = "22222",
                        //Person = _personRepository.Get(Guid.Parse("B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"))
                    }
                };
                await _jsonRepository.InsertOrUpdateAsync(o);
            }
            /*var op = new ComplexPersonTest()
            {
                Name = "JsonPerson Person test",
                Description = "New Person Description",
                JsonList = new List<JsonEntities.JsonEntity>()
                {
                    new JsonAddress() { Town = "Listed Town", Street = "Listed street" },
                    new JsonPerson() { FirstName = "11", LastName = "qq" },
                    new JsonPerson() { FirstName = "22", LastName = "ww" },
                    new JsonPerson() { FirstName = "33", LastName = "ee" },
                },
                AnyJson = new JsonPerson()
                {
                    FirstName = "JsonPerson",
                    LastName = "JsonPerson",
                    Person = _personRepository.Get(Guid.Parse("B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"))
                },
                JsonPerson = new JsonPerson()
                {
                    FirstName = "11111",
                    LastName = "22222",
                    //Person = _personRepository.Get(Guid.Parse("B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"))
                }
            };
            try
            {
                await _jsonPersonRepository.InsertOrUpdateAsync(op);
            }
            catch (Exception e)
            {
            }*/
        }

        [Fact]
        public async Task GetDto()
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var person = _personRepository.GetAll().FirstOrDefault();

                var o = new ComplexTest()
                {
                    Name = "New Person test",
                    Description = "New Person Description",
                    JsonList = new List<JsonEntities.JsonEntity>()
                {
                    new JsonAddress() { Town = "Listed Town", Street = "Listed street" },
                    new JsonPerson() { FirstName = "11", LastName = "qq" },
                    new JsonPerson() { FirstName = "22", LastName = "ww" },
                    new JsonPerson() { FirstName = "33", LastName = "ee" },
                },
                    AnyJson = new JsonAddress()
                    {
                        Town = "My Town",
                        Street = "My street",
                        PostalCode = 12345678
                    },
                    JsonPerson = new JsonPerson()
                    {
                        FirstName = "11111",
                        LastName = "22222",
                        //Person = person
                    }
                };

                var dto = await EntityToDtoModelExtesions.MapToCustomDynamicDtoAsync<DynamicDto<ComplexTest, Guid>, ComplexTest, Guid>(o);

                //var dto2 = await EntityToDtoModelExtesions.MapToCustomDynamicDtoAsync<ComplexTestDto, ComplexTest, Guid>(o);
            }
        }

        [Fact]
        public void SerializeJsonEntity()
        {
            try
            {
                LoginAsHostAdmin();

                using (var uow = _unitOfWorkManager.Begin())
                {
                    var nhuow = uow as NhUnitOfWork;

                    var person = _personRepository.GetAll().FirstOrDefault();

                    /*var person = new Person()
                    {
                        Id = Guid.NewGuid(),
                        FirstName = "Shurik 111",
                        LastName = "Shurik 222",
                    };*/

                    var pers = new JsonPerson()
                    {
                        FirstName = "Name 111",
                        LastName = "Name 222",
                        Person = person,
                        Persons = new List<JsonPerson> { new JsonPerson() { FirstName = "111", LastName = "222" } },
                        Address = new JsonAddress { Town = "My Town", Street = "My street", PostalCode = 12345678 }
                    };

                    var ps = JsonConvert.SerializeObject(pers, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

                    var pd = JsonConvert.DeserializeObject<JsonPerson>(ps);

                    var obj = new ComplexTestDto()
                    {
                        Name = "Name !!!",
                        Person = new EntityReferenceDto<Guid>(_personRepository.Get(Guid.Parse("B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"))),
                        //AnyJson = pers
                    };

                    var s = JsonConvert.SerializeObject(obj);

                    var cs = JsonConvert.DeserializeObject<ComplexTestDto>(s);
                }
            }
            catch (Exception)
            {

            }
        }
    }
}
