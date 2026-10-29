using System;
using System.Diagnostics.CodeAnalysis;

namespace Shesha.Permissions
{
    public sealed class PermissionIdentifier : IEquatable<PermissionIdentifier>, IComparable<PermissionIdentifier>, IComparable
    {
        private const char NameSeparator = '@';
        public string? Module { get; }
        public string Name { get; }

        public PermissionIdentifier(string? module, string name)
        {
            if (module is not null && string.IsNullOrWhiteSpace(module))
                throw new ArgumentException("Module cannot be empty or whitespace.", nameof(module));
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be null or empty.", nameof(name));

            Module = module;
            Name = name;
        }

        // Convenience ctor for module-less permissions
        public PermissionIdentifier(string name) : this(null, name) { }

        public override string ToString() =>
            Module is null ? Name : $"{Module}{NameSeparator}{Name}";

        // ---------- Conversion to/from string ----------

        public static implicit operator string(PermissionIdentifier permission) => permission?.ToString()!;

        public static explicit operator PermissionIdentifier(string value) => Parse(value);

        public static PermissionIdentifier Parse(string value)
        {
            if (!TryParse(value, out var result))
                throw new FormatException($"Invalid permission string: '{value}'.");
            return result!;
        }

        public static bool TryParse(string? value, [NotNullWhen(true)] out PermissionIdentifier? result)
        {
            result = null;
            if (string.IsNullOrWhiteSpace(value))
                return false;

            var idx = value.IndexOf(NameSeparator);
            if (idx < 0)
            {
                // No module - name only
                result = new PermissionIdentifier((string?)null, value);
                return true;
            }

            if (idx == 0 || idx == value.Length - 1)
                return false; // "@Name" or "Module@" are invalid

            result = new PermissionIdentifier(value.Substring(0, idx), value.Substring(idx + 1));
            return true;
        }

        // ---------- Equality ----------

        public bool Equals(PermissionIdentifier? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return string.Equals(Module, other.Module, StringComparison.Ordinal)
                && string.Equals(Name, other.Name, StringComparison.Ordinal);
        }

        public override bool Equals(object? obj) => Equals(obj as PermissionIdentifier);

        public override int GetHashCode() => HashCode.Combine(
            Module is null ? 0 : StringComparer.Ordinal.GetHashCode(Module),
            StringComparer.Ordinal.GetHashCode(Name));

        public static bool operator ==(PermissionIdentifier? left, PermissionIdentifier? right) =>
            left is null ? right is null : left.Equals(right);

        public static bool operator !=(PermissionIdentifier? left, PermissionIdentifier? right) => !(left == right);

        // ---------- Comparison ----------

        // null module sorts before any non-null module
        public int CompareTo(PermissionIdentifier? other)
        {
            if (other is null) return 1;

            int moduleCompare;
            if (Module is null && other.Module is null) moduleCompare = 0;
            else if (Module is null) moduleCompare = -1;
            else if (other.Module is null) moduleCompare = 1;
            else moduleCompare = string.CompareOrdinal(Module, other.Module);

            return moduleCompare != 0 ? moduleCompare : string.CompareOrdinal(Name, other.Name);
        }

        public int CompareTo(object? obj)
        {
            if (obj is null) return 1;
            if (obj is not PermissionIdentifier other)
                throw new ArgumentException($"Object must be of type {nameof(PermissionIdentifier)}.", nameof(obj));
            return CompareTo(other);
        }
    }
}
