import React from "react";
import { Badge } from "react-bootstrap";

interface TripStatusBadgeProps {
  status: string;
}

const TripStatusBadge: React.FC<TripStatusBadgeProps> = ({ status }) => {
  console.log("STATUS =", status);

  const getVariant = () => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "cancelled":
      case "canceled":
        return "danger";
      case "scheduled":
        return "warning";
      default:
        return "secondary";
    }
  };



  return (
    <>
      <div className="m-3 d-flex align-items-end head-font fs-5">
        <Badge
          bg={getVariant()}
          className={`px-5 py-2 fw-bolder text-uppercase shadow-lg rounded-1 ${status?.toLowerCase() === "started" ? "bg-started" : ""
            }`}
        >
          {status || "Unknown"}
        </Badge>
      </div>
      <style>
        {`
    .bg-started {
      background-color: #F8A23A !important;
      color: #fff !important;
      border: none !important;
    }
  `}
      </style>
    </>

  );
};

export default TripStatusBadge;
