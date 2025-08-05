import React, { useState, useEffect } from 'react';

interface BasicComponentProps {
  title?: string;
  readonly?: boolean;
  onChange?: (value: number) => void;
  value?: number;
  defaultValue?: number;
}

const BasicComponent: React.FC<BasicComponentProps> = ({ 
  title = 'Registered Component',
  onChange,
  value,
  defaultValue = 0,
  readonly,
}) => {
  const isControlled = value !== undefined;
  
  const [internalCount, setInternalCount] = useState<number>(defaultValue);
  
  const count = isControlled ? value : internalCount;

  useEffect(() => {
    if (!isControlled) {
      setInternalCount(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const updateCount = (newCount: number) => {
    if (!readonly) {
      if (!isControlled) {
        setInternalCount(newCount);
      }
      onChange?.(newCount);
    }
  };

  const handleIncrement = () => {
    updateCount(count + 1);
  };

  const handleDecrement = () => {
    updateCount(count - 1);
  };

  const handleReset = () => {
    updateCount(defaultValue);
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      opacity: readonly ? 0.6 : 1,
      cursor: readonly ? 'not-allowed' : 'default'
    }}>
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={handleDecrement} 
          disabled={readonly}
          style={{ cursor: readonly ? 'not-allowed' : 'pointer' }}
        >
          -
        </button>
        <button 
          onClick={handleReset} 
          disabled={readonly}
          style={{ cursor: readonly ? 'not-allowed' : 'pointer' }}
        >
          Reset
        </button>
        <button 
          onClick={handleIncrement} 
          disabled={readonly}
          style={{ cursor: readonly ? 'not-allowed' : 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default BasicComponent;

export const BasicComponentControlled: React.FC<BasicComponentProps> = ({ 
  title = 'Basic Component',
  onChange,
  value = 0,
  readonly = false
}) => {
  const handleIncrement = () => {
    if (!readonly) {
      onChange?.(value + 1);
    }
  };

  const handleDecrement = () => {
    if (!readonly) {
      onChange?.(value - 1);
    }
  };

  const handleReset = () => {
    if (!readonly) {
      onChange?.(0); // Or could accept a resetValue prop
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      opacity: readonly ? 0.6 : 1
    }}>
      <h2>{title}</h2>
      <p>Count: {value}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleDecrement} disabled={readonly}>-</button>
        <button onClick={handleReset} disabled={readonly}>Reset</button>
        <button onClick={handleIncrement} disabled={readonly}>+</button>
      </div>
    </div>
  );
};