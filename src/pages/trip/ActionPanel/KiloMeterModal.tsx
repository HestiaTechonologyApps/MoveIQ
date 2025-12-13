import { useEffect, useState, type SetStateAction } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { BsSearch } from "react-icons/bs";
import VehiclePopUp from "../../vehicle/vehicles/VehiclePopUp";
import type { Driver } from "../../../types/Driver.types";
import DriverPopup from "../../driver/DriverPopup";
import TripKilometerService from "../../../services/TripKilometer.services";

interface KmModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  tripId: number;
  editId?: number | null;
}

const KmModal: React.FC<KmModalProps> = ({ show, onHide, onSuccess, tripId, editId }) => {
  const [vehicleId, setVehicleId] = useState(0);
  const [vehicleName, setVehicleName] = useState("");
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [driverId, setDriverId] = useState(0);
  const [driverName, setDriverName] = useState("");
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [timeInAmPm, setTimeInAmPm] = useState("AM");
  const [timeOutAmPm, setTimeOutAmPm] = useState("AM");
  const [blackTopKm, setBlackTopKm] = useState(0);
  const [gradedKm, setGradedKm] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [waitingHours, setWaitingHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => { setTotalKm(blackTopKm + gradedKm) }, [blackTopKm, gradedKm]);

  useEffect(() => {
    if (show) {
      if (editId && editId > 0) {
        fetchKilometerData(editId);
      } else {
        resetForm();
      }
    }
  }, [show, editId]);

  const fetchKilometerData = async (id: number) => {
    try {
      setFetchingData(true);
      const response = await TripKilometerService.getById(id);
      console.log(response);
      if (response.isSucess && response.value) {
        const data = response.value;
        setVehicleId(data.vehicleId || 0);
        setVehicleName(data.vehicleName || "");
        setDriverId(data.driverId || 0);
        setDriverName(data.driverName || "");
        setBlackTopKm(data.tripStartReading || 0);
        setGradedKm(data.tripEndReading || 0);
        setWaitingHours(data.waitingHours?.toString() || "0");

        const t1 = parseTimeString(data.tripStartTimeString);
        if (t1) { setTimeIn(t1.time); setTimeInAmPm(t1.ampm) }

        const t2 = parseTimeString(data.tripEndingTimeString);
        if (t2) { setTimeOut(t2.time); setTimeOutAmPm(t2.ampm) }
      } else {
        toast.error("Failed to fetch kilometer details");
        onHide();
      }
    } catch (error) {
      toast.error("Error loading kilometer details");
      onHide();
    } finally {
      setFetchingData(false);
    }
  };

  const parseTimeString = (s: string) => {
    const p = s.split(" ");
    if (p.length >= 5) return { time: p[3], ampm: p[4] };
    return null;
  };

  const generate12HourTimes = () => {
    const t = [];
    for (let h = 1; h <= 12; h++) {
      for (let m = 0; m < 60; m += 15) t.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return t;
  };

  const timesList = generate12HourTimes();
 
  // This function now creates proper datetime strings without timezone conversion issues
  const convertTo24HourISO = (time: string, ampm: string) => {
    if (!time) return new Date().toISOString();
    
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    
    // Convert to 24-hour format
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    
    // Create date string in local timezone format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hourStr = String(hour).padStart(2, '0');
    const minStr = String(parseInt(m)).padStart(2, '0');
    
    // Return in ISO format without timezone conversion
    return `${year}-${month}-${day}T${hourStr}:${minStr}:00`;
  };

  const resetForm = () => {
    setVehicleId(0);
    setVehicleName("");
    setDriverId(0);
    setDriverName("");
    setTimeIn("");
    setTimeOut("");
    setTimeInAmPm("AM");
    setTimeOutAmPm("AM");
    setBlackTopKm(0);
    setGradedKm(0);
    setTotalKm(0);
    setWaitingHours("0");
  };

  const handleSubmit = async () => {
    console.log("Submit clicked - Current state:", {
      vehicleId,
      driverId,
      timeIn,
      timeOut,
      totalKm,
      blackTopKm,
      gradedKm,
      waitingHours
    });

    if (!vehicleId || !timeIn || !timeOut || totalKm <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    try {
      setLoading(true);

      const tripkiloMeter = {
        tripKiloMeterId: editId || 0,
        tripOrderId: tripId,
        driverId: driverId || 0,
        vehicleId: vehicleId,
        tripStartTime: convertTo24HourISO(timeIn, timeInAmPm),
        tripEndTime: convertTo24HourISO(timeOut, timeOutAmPm),
        tripStartReading: blackTopKm,
        tripEndReading: gradedKm,
        totalKM: totalKm,
        waitingHours: waitingHours.toString(),
        createdOn: new Date().toISOString(),
      };

      console.log("Payload being sent:", tripkiloMeter);

      let res;
      if (editId && editId > 0) {
        console.log("Updating with ID:", editId);
        res = await TripKilometerService.update(editId, tripkiloMeter);
      } else {
        console.log("Creating new record");
        res = await TripKilometerService.create(tripkiloMeter);
        console.log(res);
        
      }

      console.log("API Response:", res);

      if (!res.isSucess) {
        toast.error(res.customMessage || "Failed to save kilometer details");
        return;
      }

      if (editId && editId > 0) {
        toast.success("Trip kilometer updated successfully!");
      } else {
        toast.success("Trip kilometer added successfully!");
      }

      resetForm();
      onSuccess();
      onHide();

    } catch (error) {
      console.error("Error saving kilometer details:", error);
      toast.error("Failed to save kilometer details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { 
    resetForm(); 
    onHide();
  };

  const handleVehicleSelect = (v: { vehicleId: SetStateAction<number>; vehicleType: any; registrationNumber: any; }) => {
    setVehicleId(v.vehicleId);
    setVehicleName(`${v.vehicleType} - ${v.registrationNumber}`);
    setShowVehiclePopup(false);
  };

  const handleDriverSelect = (d: Driver) => {
    setDriverId(d.driverId);
    setDriverName(d.driverName);
    setShowDriverPopup(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#18575A", color: "white" }}>
          <Modal.Title className="fs-5">
            {fetchingData ? "Loading..." : editId ? "Edit Kilometer Details" : "Add Kilometer Details"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ fontFamily: "Urbanist" }}>
          {fetchingData ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control size="sm" type="text" readOnly placeholder="Select vehicle" value={vehicleName} className="p-2" />
                      <Button size="sm" onClick={() => setShowVehiclePopup(true)} style={{ backgroundColor: "#18575A", border: "none" }}>
                        <BsSearch />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Driver <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control
                        size="sm"
                        type="text"
                        readOnly
                        placeholder="Select driver"
                        value={driverName}
                        className="p-2"
                      />
                      <Button
                        size="sm"
                        onClick={() => setShowDriverPopup(true)}
                        style={{ backgroundColor: "#18575A", border: "none" }}
                      >
                        <BsSearch />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time In <span className="text-danger">*</span></Form.Label>
                    <Row>
                      <Col xs={7}>
                        <Form.Select size="sm" className="p-2" value={timeIn} onChange={e => setTimeIn(e.target.value)}>
                          <option value="">Select time</option>
                          {timesList.map(t => <option key={t} value={t}>{t}</option>)}
                        </Form.Select>
                      </Col>
                      <Col xs={5}>
                        <Form.Select size="sm" className="p-2" value={timeInAmPm} onChange={e => setTimeInAmPm(e.target.value)}>
                          <option>AM</option><option>PM</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Out <span className="text-danger">*</span></Form.Label>
                    <Row>
                      <Col xs={7}>
                        <Form.Select size="sm" className="p-2" value={timeOut} onChange={e => setTimeOut(e.target.value)}>
                          <option value="">Select time</option>
                          {timesList.map(t => <option key={t} value={t}>{t}</option>)}
                        </Form.Select>
                      </Col>
                      <Col xs={5}>
                        <Form.Select size="sm" className="p-2" value={timeOutAmPm} onChange={e => setTimeOutAmPm(e.target.value)}>
                          <option>AM</option><option>PM</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Black Top K.M <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" value={blackTopKm} onChange={e => setBlackTopKm(Number(e.target.value))} min={0} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Graded Roads K.M <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" value={gradedKm} onChange={e => setGradedKm(Number(e.target.value))} min={0} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total K.M</Form.Label>
                    <Form.Control type="number" readOnly value={totalKm} style={{ backgroundColor: "#f0f0f0" }} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Waiting Hours<span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" value={waitingHours} onChange={e => setWaitingHours((e.target.value))} min={0} />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading || fetchingData}>
            Cancel
          </Button>
          <Button 
            style={{ backgroundColor: "#18575A", border: "none" }} 
            onClick={handleSubmit}
            disabled={loading || fetchingData}
          >
            {loading ? "Saving..." : editId ? "Update Details" : "Save Details"}
          </Button>
        </Modal.Footer>
      </Modal>

      <VehiclePopUp show={showVehiclePopup} handleClose={() => setShowVehiclePopup(false)} onSelect={handleVehicleSelect} />
      <DriverPopup
        show={showDriverPopup}
        handleClose={() => setShowDriverPopup(false)}
        onSelect={handleDriverSelect}
      />
    </>
  );
};

export default KmModal;