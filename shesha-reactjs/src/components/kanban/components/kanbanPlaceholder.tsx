import React from "react";
import { Card, Col, Row } from "antd";

export const KanbanPlaceholder = (): JSX.Element => {
  const placeholderColumns = ["This", "Is", "A", "Placeholder"];

  return (
    <Row gutter={16} style={{ padding: "10px" }}>
      {placeholderColumns.map((column) => (
        <Col key={column} span={6}>
          <Card title={column} bordered={false} style={{ minHeight: "200px", backgroundColor: "#f5f5f5" }}>
            <p style={{ textAlign: "center", color: "#999" }}>kanban placeholder</p>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default KanbanPlaceholder;
