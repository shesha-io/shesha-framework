﻿using Abp.Json;
using AutoMapper.Internal;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.AutoMapper.Dto;
using Shesha.Extensions;
using Shesha.JsonEntities.Proxy;
using Shesha.JsonLogic;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Shesha.DynamicEntities
{
    public static class ObjectToJsonExtension
    {
        public static bool IsServiceDtoField(PropertyInfo p)
        {
            var name = p.Name.ToCamelCase();
            return name == nameof(IHasFormFieldsList._formFields)
                || name == nameof(IHasJObjectField._jObject).ToCamelCase()
                || name == nameof(IJsonEntityProxy._json).ToCamelCase()
                || name == nameof(IJsonEntityProxy._isInitialized).ToCamelCase()
                || name == nameof(IJsonEntityProxy._references).ToCamelCase();
        }

        public static void ObjectToJObject(object? obj, JObject jobj, bool addMissedProperties = true)
        {
            GetJObjectFromObject(obj, jobj, addMissedProperties);
        }

        public static JObject GetJObjectFromObject(object? obj, JObject? jobj = null, bool addMissedProperties = true)
        {
            jobj ??= new JObject();

            if (obj == null) return jobj;

            var props = obj.GetType().GetProperties().Where(p =>
                p.CanRead && p.IsPublic()
                && !p.HasAttribute<JsonIgnoreAttribute>()
                && !p.HasAttribute<System.Text.Json.Serialization.JsonIgnoreAttribute>()
                && !IsServiceDtoField(p))
                .ToList();

            foreach (var prop in props)
            {
                try
                {
                    if (!jobj.ContainsKey(prop.Name.ToCamelCase()))
                        if (!addMissedProperties) continue;
                        else jobj.Add(prop.Name.ToCamelCase(), null);

                    var jprop = jobj.Property(prop.Name.ToCamelCase()).NotNull();

                    var val = prop.GetValue(obj);

                    if (val is IJsonEntityProxy proxy)
                        jprop.Value = JsonEntityProxy.GetJson(proxy, jprop.Value as JObject);
                    else {
                        if (prop.IsMultiValueReferenceListProperty())
                        {
                            var arrayValue = val != null
                                ? EntityExtensions.DecomposeIntoBitFlagComponents((Int64)System.Convert.ChangeType(val, typeof(Int64)))
                                : new Int64[0];
                            
                            jprop.Value = ValueToJson(arrayValue.GetType(), arrayValue, jprop.Value, addMissedProperties);
                        } else
                            jprop.Value = ValueToJson(prop.PropertyType, val, jprop.Value, addMissedProperties);
                    }
                }
                catch (Exception e)
                {
                    throw
                        new Exception($"GetJObjectFromObject. ObjectType: {obj?.GetType().FullName}, jObj: {jobj.ToJsonString()}, prop: {prop?.Name}, propValue: {prop?.GetValue(obj)}", e);
                }
            }

            return jobj;
        }

        public static JToken ValueToJson(Type propType, object? val, JToken? jval, bool addMissedProperties = true)
        {
            if (val == null || !val.GetType().IsAssignableTo(propType)) 
                return JValue.CreateNull();

            if (ObjectExtensions.IsListType(propType)
                || ObjectExtensions.IsDictionaryType(propType))
            {
                jval = jval.IsNullOrEmpty() ? new JArray() : jval;
                if (val is IEnumerable<object> list && list.Any() && jval is JArray jlist)
                {
                    var lType = propType.GetGenericArguments()[0];
                    var i = 0;
                    foreach (var item in list)
                    {
                        var jitem = jlist.Count > i ? jlist[i] : null;
                        jitem = ValueToJson(lType, item, jitem, addMissedProperties);
                        if (jlist.Count == i) jlist.Add(jitem);
                        else jlist[i] = jitem;
                        i++;
                    }
                }
                return jval;
            }

            if (propType.IsClass && !propType.IsSystemType() && !propType.IsEntityType())
            {
                if (val is IJsonEntityProxy proxy)
                    return JsonEntityProxy.GetJson(proxy, jval as JObject);

                if (val is Geometry geometry)
                    return ConvertGeometry(geometry);

                jval = jval.IsNullOrEmpty() ? new JObject() : jval;
                var newjval = GetJObjectFromObject(val, jval as JObject);
                if (jval.IsNullOrEmpty())
                    jval = newjval;
                return jval;
            }

            if (propType.IsEntityType())
            {
                var jref = new JObject();
                jref.Add(nameof(EntityReferenceDto<int>._displayName).ToCamelCase(), JProperty.FromObject(val.GetEntityDisplayName() ?? string.Empty));
                jref.Add(nameof(EntityReferenceDto<int>._className).ToCamelCase(), JProperty.FromObject(propType.GetRequiredFullName()));
                jref.Add(nameof(EntityReferenceDto<int>.Id).ToCamelCase(), JProperty.FromObject(val.GetId().NotNull()));
                return jref;
            }

            // TODO: Alex, please review
#pragma warning disable CS8602
            if (val != null && jval.IsNullOrEmpty()
                || !val.Equals(jval?.ToObject(propType)))
                return JProperty.FromObject(val);
#pragma warning restore CS8602

            return jval ?? JValue.CreateNull();
        }

        private static JToken ConvertGeometry(Geometry geometry) 
        {
            var serializer = GeoJsonSerializer.Create();
            using (var stringWriter = new StringWriter())
            {
                using (var jsonWriter = new JsonTextWriter(stringWriter))
                {
                    serializer.Serialize(jsonWriter, geometry);

                    var geoJson = stringWriter.ToString();
                    var result = JObject.Parse(geoJson);
                    return result;
                }
            }
        }
    }
}
