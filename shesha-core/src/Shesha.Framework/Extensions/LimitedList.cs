using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Shesha.Extensions
{
    public class LimitedList<T> : Collection<T>
    {
        private readonly int _maxCapacity;

        public LimitedList(int maxCapacity)
        {
            if (maxCapacity < 0)
                throw new ArgumentOutOfRangeException(nameof(maxCapacity));
            _maxCapacity = maxCapacity;
        }

        public LimitedList(int maxCapacity, IList<T> items): base(items)
        {
            if (maxCapacity < 0) throw new ArgumentOutOfRangeException(nameof(maxCapacity));
            
            _maxCapacity = maxCapacity;

            if (Count > _maxCapacity)
                throw new InvalidOperationException($"Initial collection contains {Count} items, what exceeds the allowed maximum {_maxCapacity}.");
        }

        public int MaxCapacity => _maxCapacity;

        protected override void InsertItem(int index, T item)
        {
            if (Count >= _maxCapacity)
                throw new InvalidOperationException($"Unable to add item. The collection has reached its maximum capacity ({_maxCapacity}).");
            base.InsertItem(index, item);
        }
    }
}
