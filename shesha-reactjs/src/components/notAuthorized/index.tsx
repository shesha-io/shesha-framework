import React, { FC } from 'react';
import { Result, Button } from 'antd';
import { useShaRouting } from '@/providers/shaRouting';

export const NotAuthorized: FC = () => {
  const { router } = useShaRouting();

  return (
    <div className="not-authorized">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={(
          <Button type="primary" onClick={() => router?.push('/')}>
            Back Home
          </Button>
        )}
      />
    </div>
  );
};

export default NotAuthorized;
