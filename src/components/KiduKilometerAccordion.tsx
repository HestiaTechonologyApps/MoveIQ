import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Accordion, Table, Button, Spinner, Alert, Modal } from "react-bootstrap";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { TripKilometer } from "../types/TripKilometer.types";
import TripKilometerService from "../services/TripKilometer.services";
import KmModal from "../pages/trip/ActionPanel/KiloMeterModal";

interface KiduKilometerAccordionProps {
  tripId: number;
}

export interface KiduKilometerAccordionRef {
  refreshData: () => void;
}

const KiduKmAccordion = forwardRef<KiduKilometerAccordionRef, KiduKilometerAccordionProps>(
  ({ tripId }, ref) => {

    const [kilometers, setKilometers] = useState<TripKilometer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
      if (tripId) fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await TripKilometerService.getByTripId(tripId);
        console.log(response);
        if (response.isSucess) {
          setKilometers(response.value);
        } else {
          setKilometers([]);
        }
      } catch {
        setError("Failed to fetch trip kilometer data.");
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({ refreshData: fetchData }));

    const handleAddClick = () => {
      setEditId(null);
      setShowModal(true);
    };

    const handleEditClick = (id: number) => {
      setEditId(id);
      setShowModal(true);
    };

    const handleModalClose = () => {
      setShowModal(false);
      setEditId(null);
    };

    const handleSuccess = () => {
      fetchData();
    };

    const handleDelete = async () => {
      if (!deleteId) return;

      try {
        setDeleting(true);
        const res = await TripKilometerService.delete(deleteId);

        if (res.isSucess) {
          toast.success("Deleted successfully");
          setDeleteId(null);
          await fetchData();
        } else {
          toast.error(res.customMessage || "Failed to delete");
        }
      } catch {
        toast.error("Failed to delete");
      } finally {
        setDeleting(false);
      }
    };

    return (
      <>
        <Accordion className="mt-4 custom-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <span className="fw-bold fs-6 head-font" style={{ color: "#18575A" }}>
                Trip Kilometer Details ({kilometers.length})
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  size="sm"
                  className="head-font fw-bold"
                  style={{ backgroundColor: "#18575A", border: "none" }}
                  onClick={handleAddClick}
                >
                  <Plus size={16} className="me-1" /> Add Kilometer
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : kilometers.length === 0 ? (
                <Alert variant="info" className="text-center">
                  No kilometer records found for this trip. Click "Add Kilometer" to create one.
                </Alert>
              ) : (
                <Table bordered hover responsive>
                  <thead style={{ backgroundColor: "#18575A", color: "white" }}>
                    <tr className="head-font text-center">
                      <th className="bg-secondary text-white">Sl No</th>
                      <th className="bg-secondary text-white">K.M Id</th>
                      <th className="bg-secondary text-white">Vehicle</th>
                      <th className="bg-secondary text-white">Driver</th>
                      <th className="bg-secondary text-white">Waiting Hours</th>
                      <th className="bg-secondary text-white">Time In</th>
                      <th className="bg-secondary text-white">Time Out</th>
                      <th className="bg-secondary text-white">Black Top KM</th>
                      <th className="bg-secondary text-white">Graded KM</th>
                      <th className="bg-secondary text-white">Total KM</th>
                      <th className="bg-secondary text-white">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {kilometers.map((k, i) => {
                      const uniqueKey = k.tripKiloMeterId > 0 
                        ? k.tripKiloMeterId 
                        : `${k.tripOrderId}-${k.vehicleId}-${i}`;
                      
                      return (
                        <tr key={uniqueKey} className="head-font text-center">
                          <td>{i + 1}</td>
                          <td>{k.tripKiloMeterId}</td>
                          <td>{k.vehicleName}</td>
                          <td>{k.driverName}</td>
                          <td>{k.waitingHours}</td>
                          <td>{k.tripStartTimeString}</td>
                          <td>{k.tripEndingTimeString}</td>
                          <td>{k.tripStartReading}</td>
                          <td>{k.tripEndReading}</td>
                          <td className="fw-bold">{k.totalKM}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline"
                              className="me-2"
                              style={{ borderColor: "#18575A" }}
                              onClick={() => handleEditClick(k.tripKiloMeterId)}
                            >
                              <Pencil size={14} color="#18575A" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setDeleteId(k.tripKiloMeterId)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <KmModal
          show={showModal}
          onHide={handleModalClose}
          onSuccess={handleSuccess}
          tripId={tripId}
          editId={editId}
        />

        <Modal show={!!deleteId} onHide={() => setDeleteId(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this kilometer record?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
);

KiduKmAccordion.displayName = "TripKilometerAccordion";

export default KiduKmAccordion;