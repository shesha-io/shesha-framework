import React, { FC } from 'react';
import { useStyles } from '@/components/dataList/styles/styles';

// Static placeholder shown when DataList has configuration errors
export const DataListPlaceholder: FC = () => {
  const { theme } = useStyles();

  // Show preview items that look like actual list items
  const previewItems = [
    { heading: 'Heading', subtext: 'Subtext' },
    { heading: 'Heading', subtext: 'Subtext' },
    { heading: 'Heading', subtext: 'Subtext' },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
      {/* Preview list items - clean placeholder style */}
      <div style={{ height: '100%', overflow: 'auto' }}>
        {previewItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginBottom: index < previewItems.length - 1 ? '1px' : '0',
              borderTop: index === 0 ? `1px solid ${theme.colorBorder}` : 'none',
              borderBottom: `1px solid ${theme.colorBorder}`,
            }}
          >
            {/* Icon placeholder */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: theme.colorFillSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '18px',
                color: theme.colorTextQuaternary,
              }}
            >
              👤
            </div>
            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  color: theme.colorTextSecondary,
                  marginBottom: '4px',
                }}
              >
                {item.heading}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: theme.colorTextTertiary,
                }}
              >
                {item.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
