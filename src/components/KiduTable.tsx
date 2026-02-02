import React, { useState, useMemo, useEffect, useRef } from "react";
import { Table, Button, Row, Col, Container, Pagination } from "react-bootstrap";
import { FaEdit, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import KiduExcelButton from "../components/KiduExcelButton";
import KiduButton from "../components/KiduButton";
import KiduSearchBar from "../components/KiduSearchBar";
import KiduPopupButton from "../components/KiduPopupButton";
import KiduLoader from "./KiduLoader";
import defaultProfile from "../assets/Images/profile.jpeg";


interface Column {
  key: string;
  label: string;
}

interface KiduTableProps {
  title?: string;
  subtitle?: string;
  columns: Column[];
  data: any[];
  idKey?: string;
  addButtonLabel?: string;
  addRoute?: string;
  viewRoute?: string;
  editRoute?: string;
  showAddButton?: boolean;
  showKiduPopupButton?: boolean;
  showExport?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRowClick?: (item: any) => void;
  AddModalComponent?: React.ComponentType<{
    show: boolean;
    handleClose: () => void;
    onAdded: (newItem: any) => void;
  }>;
  onAddClick?: () => void;
  showSearch?: boolean;
  showActions?: boolean;
  showTitle?: boolean;
}

const KiduTable: React.FC<KiduTableProps> = ({
  title = "Table",
  subtitle = "",
  columns,
  data,
  idKey = "id",
  addButtonLabel = "Add New",
  addRoute,
  viewRoute,
  editRoute,
  showAddButton = true,
  showKiduPopupButton = false,
  showExport = true,
  loading = false,
  error = null,
  onRowClick,
  onRetry,
  AddModalComponent,
  onAddClick,
  showSearch = true,
  showActions = true,
  showTitle = true
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const rowsPerPage = 10;

  const reversedData = useMemo(() => [...data].reverse(), [data]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return reversedData.filter(item =>
      columns.some(col =>
        String(item[col.key] || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [reversedData, searchTerm, columns]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, data.length]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // compute field name for "Add <Field>"
  const fieldName = title ? title.replace("Select ", "") : addButtonLabel;

  if (loading) return <KiduLoader type="trip..." />;

  if (error) {
    return (
      <Container fluid className="py-3 mt-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={onRetry} style={{ backgroundColor: "#18575A", border: "none" }}>Retry</Button>
      </Container>
    );
  }


  return (
    <Container fluid className="py-3 mt-4">
      {/* Conditionally show title/subtitle row */}
      {showTitle !== false && (
        <Row className="mb-2 align-items-center">
          <Col>
            <h4 className="mb-0 fw-bold" style={{ fontFamily: "Urbanist" }}>{title}</h4>
            {subtitle && <p className="text-muted" style={{ fontFamily: "Urbanist" }}>{subtitle}</p>}
          </Col>
        </Row>
      )}

      
        <Row className="mb-3 align-items-center">
          {showSearch && (
            <Col>
              <KiduSearchBar
                placeholder="Search..."
                onSearch={(val) => {
                  setSearchTerm(val);
                }}
                width="250px"
              />
            </Col>
          )}

          {showAddButton && addRoute && (
            <Col xs="auto" className="text-end">
              <KiduButton
                label={`+ ${addButtonLabel}`}
                to={addRoute}
                className="fw-bold d-flex align-items-center text-white"
                style={{ backgroundColor: "#18575A", border: "none", height: 45, width: 200 }}
              />
            </Col>
          )}
        </Row>
      

      <Row>
        <Col>
          <div ref={tableRef} className="table-responsive">
            <Table striped bordered hover className="align-middle mb-0">
              <thead className="table-light text-center" style={{ fontFamily: "Urbanist" }}>
                <tr>
                  {columns.map(col => <th key={col.key}>{col.label}</th>)}
                  {showActions && (
                    <th className="d-flex justify-content-between">
                      <div className="ms-5 mt-2">Action</div>
                      {showExport && data.length > 0 && (
                        <div className="mt-1">
                          <KiduExcelButton data={data} title={title} />
                        </div>
                      )}
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="text-center" style={{ fontFamily: "Urbanist", fontSize: 13 }}>
                {currentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (showActions ? 2 : 1)}
                      className="text-center py-5"
                      style={{ border: "2px solid #dee2e6" }}
                    >
                      <div className="d-flex flex-column justify-content-center align-items-center">
                        <p className="text-muted mb-3">No matching records found</p>

                        {showKiduPopupButton && (AddModalComponent || addRoute) && (
                          <KiduPopupButton
                            label={`Add ${fieldName}`}
                            onClick={() => {
                              if (onAddClick) onAddClick();
                              else if (addRoute) navigate(addRoute);
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr
                      key={`${item[idKey]}-${startIndex + index}`}
                      onClick={() => onRowClick?.(item)}
                      style={{ cursor: onRowClick ? "pointer" : "default" }}
                    >
                      {columns.map((col) => (
                        <td key={`${item[idKey]}-${col.key}`}>
                          {col.key === "profile" ? (
                            <img
                              src={item[col.key] || defaultProfile}
                              alt="Profile"
                              style={{ width: 45, height: 45, borderRadius: "50%", objectFit: "cover" }}
                              onError={(e: any) => { e.target.src = defaultProfile; }}
                            />
                          ) : (
                            item[col.key]
                          )}
                        </td>
                      ))}


                      {showActions && (
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex justify-content-center gap-2">
                            {editRoute && (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #18575A",
                                  color: "#18575A",
                                }}
                                onClick={() => {
                                  console.log("Edit clicked - Item ID:", item[idKey]);
                                  navigate(`${editRoute}/${item[idKey]}`);
                                }}
                              >
                                <FaEdit className="me-1" /> Edit
                              </Button>
                            )}

                            {viewRoute && (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: "#18575A",
                                  border: "none",
                                  color: "white",
                                }}
                                onClick={() => {
                                  console.log("View clicked - Item ID:", item[idKey]);
                                  navigate(`${viewRoute}/${item[idKey]}`);
                                }}
                              >
                                <FaEye className="me-1" /> View
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
          <span style={{ fontFamily: "Urbanist", color: "#18575A", fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          <Pagination className="m-0">
            <Pagination.First disabled={currentPage === 1} onClick={() => handlePageChange(1)} />
            <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => handlePageChange(i + 1)}
                style={{
                  backgroundColor: i + 1 === currentPage ? "#18575A" : "white",
                  borderColor: "#18575A",
                  color: i + 1 === currentPage ? "white" : "#18575A"
                }}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
            <Pagination.Last disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default KiduTable;