import { Transfer } from "antd";
import React from "react";

export const MyTransfer = () => {
  const mockData = [];
  for (let i = 0; i < 20; i++) {
    mockData.push({
      key: i.toString(),
      title: `content${i + 1}`,
      description: `description of content${i + 1}`,
    });
  }

  return (
    <Transfer
      dataSource={mockData}
      targetKeys={['18']}
      selectedKeys={['3']}
      render={item => item.title}
    />
  );
};