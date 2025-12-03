import React from "react";
import { Card } from "react-bootstrap";

interface InvoiceCardProps {
  title: string;
  value: number;
   change?: number;
  color: string;
  onClick?: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  title,
  value,
  color,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className="shadow-sm w-100 me-3 overview-card"
      style={{
        backgroundColor: color,
        color: "white",
        height: "90px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      <Card.Body className="p-2 d-flex flex-column justify-content-center align-items-center">
        <p
          className="mb-1 fw-bold head-font fs-6"
          style={{ fontSize: "0.95rem" }}
        >
          {title} - ({value})
        </p>

        {/* <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0 sub-font" style={{ fontSize: "0.75rem" }}>
            {value}
          </p>
        </div> */}
      </Card.Body>
    </Card>
  );
};

export default InvoiceCard;
