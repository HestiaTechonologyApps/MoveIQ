import React, { useState, useEffect, useRef, useCallback } from "react";
import { Table, Button, Row, Col, Container, Pagination, InputGroup, Form } from "react-bootstrap";
import { FaEdit, FaEye, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import KiduLoader from "../KiduLoader";
import KiduSearchBar from "../KiduSearchBar";
import KiduButton from "../KiduButton";
import KiduExcelButton from "../KiduExcelButton";
import KiduPopupButton from "../KiduPopupButton";
import { BsSearch } from "react-icons/bs";
import CustomerPopup from "../../pages/customer/CustomerPopup";
import KiduPrevious from "../KiduPrevious";
import toast, { Toaster } from "react-hot-toast";

interface Column {
  key: string;
  label: string;
}

interface KiduServerTableProps {
  title?: string;
  subtitle?: string;
  columns: Column[];
  idKey?: string;
  addButtonLabel?: string;
  addRoute?: string;
  viewRoute?: string;
  editRoute?: string;
  showAddButton?: boolean;
  showBackButton?:boolean;
  showCustomerPopUp?: boolean;
  showInvoiceButton?: boolean;
  showKiduPopupButton?: boolean;
  showExport?: boolean;
  showCheckbox?: boolean;
  onRowClick?: (item: any) => void;
  onAddClick?: () => void;
  showSearch?: boolean;
  showActions?: boolean;
  showTitle?: boolean;
  fetchData: (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    customerId?: number;
  }) => Promise<{ data: any[]; total: number }>;
  rowsPerPage?: number;
  showStartButton?: boolean;
  onStartTrip?: (item: any) => Promise<void>;
  onGenerateInvoice?: (selectedIds: string[], customerId?: number) => void;
}

const KiduServerTable: React.FC<KiduServerTableProps> = ({
  title = "Table",
  subtitle = "",
  columns,
  idKey = "id",
  addButtonLabel = "Add New",
  addRoute,
  viewRoute,
  editRoute,
  showAddButton = true,
  showBackButton = false,
  showCustomerPopUp = false,
  showInvoiceButton = false,
  showKiduPopupButton = false,
  showExport = true,
  showCheckbox = false,
  onRowClick,
  onAddClick,
  showSearch = true,
  showActions = true,
  showTitle = true,
  fetchData,
  rowsPerPage = 10,
  showStartButton = false,
  onStartTrip,
  onGenerateInvoice
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingTrips, setStartingTrips] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());


  const totalPages = Math.ceil(total / rowsPerPage);

  const loadData = useCallback(async (page: number, search: string, custId?: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 KiduServerTable - Loading data for:", {
        page,
        search,
        rowsPerPage
      });

      const result = await fetchData({
        pageNumber: page,
        pageSize: rowsPerPage,
        searchTerm: search,
        customerId: custId || 0,
      });

      console.log("📊 KiduServerTable - Received data:", {
        dataLength: result.data?.length,
        total: result.total,
        firstItem: result.data?.[0]
      });

      setData(result.data || []);
      setTotal(result.total || 0);

    } catch (err: any) {
      console.error("❌ KiduServerTable - Error:", err);
      setError(err.message || "Failed to load data");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fetchData, rowsPerPage]);

  useEffect(() => {
    console.log("🚀 KiduServerTable - Initial load");
    loadData(currentPage, searchTerm, selectedCustomer?.customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, currentPage, searchTerm, selectedCustomer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "" || currentPage !== 1) {
        console.log("🔍 KiduServerTable - Search triggered:", searchTerm);
        setCurrentPage(1);
        loadData(1, searchTerm, selectedCustomer?.customerId);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, loadData, selectedCustomer]);

  useEffect(() => {
    loadData(currentPage, searchTerm);  // ✅ Always load when page changes
  }, [currentPage, loadData, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleStartTrip = async (item: any) => {
    if (!onStartTrip) return;

    const tripId = item[idKey];
    setStartingTrips(prev => new Set(prev).add(tripId));

    try {
      await onStartTrip(item);
      // Reload data after successful start
      await loadData(currentPage, searchTerm, selectedCustomer?.customerId);
    } catch (error) {
      console.error("Failed to start trip:", error);
      alert("Failed to start trip. Please try again.");
    } finally {
      setStartingTrips(prev => {
        const newSet = new Set(prev);
        newSet.delete(tripId);
        return newSet;
      });
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(data.map(item => item[idKey])));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (itemId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRetry = () => {
    loadData(currentPage, searchTerm, selectedCustomer?.customerId);
  };

  const fieldName = title ? title.replace("Select ", "") : addButtonLabel;

  if (loading && data.length === 0) return <KiduLoader type="trip..." />;

  if (error && data.length === 0) {
    return (
      <Container fluid className="py-3 mt-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={handleRetry} style={{ backgroundColor: "#18575A", border: "none" }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 mt-4">
     {showTitle !== false && total > 0 && (
        <Row className="mb-2 align-items-center">
          <Col>
           <div className="d-flex">
           <span className="me-2"> {showBackButton && <KiduPrevious/>}</span>
              <h4 className="mb-0 fw-bold mt-1" style={{ fontFamily: "Urbanist" }}>
                 {title}
              </h4>
           </div>
            {subtitle && (
              <p className="text-muted" style={{ fontFamily: "Urbanist" }}>
                {subtitle}
              </p>
            )}
          </Col>
        </Row>
      )}

      {total > 0 && (
        <Row className="mb-3 align-items-center">
          {showSearch && (
            <Col>
              <KiduSearchBar
                placeholder="Search..."
                onSearch={(val) => setSearchTerm(val)}
                width="250px"
              />
            </Col>
          )}
          {showCustomerPopUp && (
            <Col md={3}>
              <InputGroup>
                <Form.Control
                  size="sm"
                  type="text"
                  readOnly
                  placeholder="Select customer"
                  value={selectedCustomer?.customerName || ""}
                  style={{
                    height: "31px",
                    fontSize: "13px",
                    borderColor: "#dee2e6",
                    borderRight: "none",
                    boxShadow: "none",
                    fontFamily: "Urbanist",
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => setShowCustomerModal(true)}
                  style={{
                    backgroundColor: "#18575A",
                    border: "none",
                    height: "31px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingInline: "12px",
                  }}
                >
                  <BsSearch />
                </Button>
                {selectedCustomer && (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
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
          {showInvoiceButton && (
            <Col xs="auto" className="ms-auto text-end">
              <KiduButton
                label="Generate Invoice"
                onClick={() => {
        if (selectedRows.size === 0) {
          toast.error("Please select at least one trip to generate invoice");
          return;
        }
        if (!selectedCustomer) {
          toast.error("Please select a customer");
          return;
        }
        if (onGenerateInvoice) {
          onGenerateInvoice(
            Array.from(selectedRows),
            selectedCustomer?.customerId
          );
        }
      }}
                className="fw-bold d-flex align-items-center text-white"
                style={{ backgroundColor: "#18575A", border: "none", height: 45, width: 200 }}
              />
            </Col>
          )}
        </Row>
      )}

      <Row>
        <Col>
          <div ref={tableRef} className="table-responsive">
            <Table striped bordered hover className="align-middle mb-0">
              <thead className="table-light text-center" style={{ fontFamily: "Urbanist" }}>
                <tr>
                  {showCheckbox && (
                    <th style={{ width: "50px" }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.size === data.length && data.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {showActions && (
                    <th className="d-flex justify-content-between">
                      <div className="ms-5 mt-2">Action</div>
                      {showExport && total > 0 && (
                        <div className="mt-1">
                          <KiduExcelButton data={data} title={title} />
                        </div>
                      )}
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="text-center" style={{ fontFamily: "Urbanist", fontSize: 13 }}>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + (showActions ? 1 : 0) + (showCheckbox ? 1 : 0)} className="text-center py-5">
                      <KiduLoader type="trip..." />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (showActions ? 1 : 0) + (showCheckbox ? 1 : 0)}
                      className="text-center py-5"
                      style={{ border: "2px solid #dee2e6" }}
                    >
                      <div className="d-flex flex-column justify-content-center align-items-center">
                        <p className="text-muted mb-3">No matching records found</p>

                        {showKiduPopupButton && addRoute && (
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
                  data.map((item, index) => (
                    <tr
                      key={`${item[idKey]}-${index}`}
                      onClick={() => onRowClick?.(item)}
                      style={{ cursor: onRowClick ? "pointer" : "default" }}
                    >
                      {showCheckbox && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRows.has(item[idKey])}
                            onChange={() => handleSelectRow(item[idKey])}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={`${item[idKey]}-${col.key}`}>
                          {col.key === "profile" ? (
                            <img
                              src={item[col.key] || "/assets/Images/profile.jpeg"}
                              alt="Profile"
                              style={{ width: 45, height: 45, borderRadius: "50%" }}
                            />
                          ) : (
                            item[col.key]
                          )}
                        </td>
                      ))}

                      {showActions && (
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex justify-content-center gap-2">
                            {showStartButton && (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: "#0e501dff",
                                  border: "none",
                                  color: "white",
                                }}
                                onClick={() => handleStartTrip(item)}
                                disabled={startingTrips.has(item[idKey])}
                              >
                                {startingTrips.has(item[idKey]) ? (
                                  <>Starting...</>
                                ) : (
                                  <>
                                    <FaPlay className="me-1" /> Start
                                  </>
                                )}
                              </Button>
                            )}

                            {editRoute && (
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "1px solid #18575A",
                                  color: "#18575A",
                                }}
                                onClick={() => {
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
            Page {currentPage} of {totalPages} (Total: {total} records)
          </span>

          <Pagination className="m-0">
            <Pagination.First disabled={currentPage === 1} onClick={() => handlePageChange(1)} />
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    backgroundColor: pageNum === currentPage ? "#18575A" : "white",
                    borderColor: "#18575A",
                    color: pageNum === currentPage ? "white" : "#18575A",
                  }}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            />
            <Pagination.Last
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            />
          </Pagination>
        </div>
      )}

      {showCustomerModal && (
        <div>
          {/* Replace this with your actual CustomerPopup component */}
          <CustomerPopup
            show={showCustomerModal}
            handleClose={() => setShowCustomerModal(false)}
            onSelect={(customer) => {
              setSelectedCustomer(customer);
              setShowCustomerModal(false);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
      <Toaster position="top-right" />
    </Container>
  );
};

export default KiduServerTable;