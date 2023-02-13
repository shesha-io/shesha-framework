using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Runtime.Serialization;

namespace Shesha.MongoRepository.Mongo
{
    [DataContract]
    [Serializable]
    [BsonIgnoreExtraElements(Inherited = false)]
    public abstract class MongoEntity
    {
        [DataMember]
        [BsonRepresentation(BsonType.String)]
        public virtual string Id { get; set; }
    }
}
