import { useEffect, useState, type SetStateAction } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { BsSearch } from "react-icons/bs";
import VehiclePopUp from "../../vehicle/vehicles/VehiclePopUp";

interface KmModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: any) => void;
  editData?: any;
  tripId: number;
  driverId?: number;
}

const KmModal: React.FC<KmModalProps> = ({ show, onHide, onSave, editData }) => {
  const [vehicleId, setVehicleId] = useState(0);
  const [vehicleName, setVehicleName] = useState("");
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [timeInAmPm, setTimeInAmPm] = useState("AM");
  const [timeOutAmPm, setTimeOutAmPm] = useState("AM");
  const [blackTopKm, setBlackTopKm] = useState(0);
  const [gradedKm, setGradedKm] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [waitingHours, setWaitingHours] = useState("");

  useEffect(() => { setTotalKm(blackTopKm + gradedKm) }, [blackTopKm, gradedKm]);

  useEffect(() => {
    if (editData && show) {
      setVehicleId(editData.vehicleId);
      //setVehicleName(`${editData.vehicleType || ""} - ${editData.registrationNumber || ""}`);
      setVehicleName(editData.vehicleName);
      setBlackTopKm(editData.tripStartReading);
      setGradedKm(editData.tripEndReading);
      setWaitingHours(editData.waitingHours)

      // eslint-disable-next-line react-hooks/immutability
      const t1 = parseTimeString(editData.tripStartTimeString);
      if (t1) { setTimeIn(t1.time); setTimeInAmPm(t1.ampm) }

      const t2 = parseTimeString(editData.tripEndingTimeString);
      if (t2) { setTimeOut(t2.time); setTimeOutAmPm(t2.ampm) }
      // eslint-disable-next-line react-hooks/immutability
    } else resetForm();
  }, [editData, show]);

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

  const convertTo24HourISO = (time: string, ampm: string) => {
    if (!time) return new Date().toISOString();
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    const d = new Date();
    d.setHours(hour, parseInt(m), 0, 0);
    return d.toISOString();
  };

  const resetForm = () => {
    setVehicleId(0);
    setVehicleName("");
    setTimeIn("");
    setTimeOut("");
    setTimeInAmPm("AM");
    setTimeOutAmPm("AM");
    setBlackTopKm(0);
    setGradedKm(0);
    setTotalKm(0);
    setWaitingHours("")
  };

  const handleSubmit = () => {
    if (!vehicleId || !timeIn || !timeOut || totalKm <= 0) {
      toast.error("Please fill all fields correctly!");
      return;
    }

    onSave({
      vehicleId,
      timeIn: convertTo24HourISO(timeIn, timeInAmPm),
      timeOut: convertTo24HourISO(timeOut, timeOutAmPm),
      blackTopKm,
      gradedKm,
      totalKm,
      waitingHours
    });

    resetForm();
    onHide();
  };


  const handleClose = () => { resetForm(); onHide() };

  const handleVehicleSelect = (v: { vehicleId: SetStateAction<number>; vehicleType: any; registrationNumber: any; }) => {
    setVehicleId(v.vehicleId);
    setVehicleName(`${v.vehicleType} - ${v.registrationNumber}`);
    setShowVehiclePopup(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#18575A", color: "white" }}>
          <Modal.Title className="fs-5">{editData ? "Edit Kilometer Details" : "Add Kilometer Details"}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ fontFamily: "Urbanist" }}>
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
                  <Form.Label>Waiting Hours<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" value={waitingHours} onChange={e => setWaitingHours((e.target.value))} min={0} />
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Total K.M</Form.Label>
                  <Form.Control type="number" readOnly value={totalKm} style={{ backgroundColor: "#f0f0f0" }} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button style={{ backgroundColor: "#18575A", border: "none" }} onClick={handleSubmit}>{editData ? "Update Details" : "Save Details"}</Button>
        </Modal.Footer>
      </Modal>

      <VehiclePopUp show={showVehiclePopup} handleClose={() => setShowVehiclePopup(false)} onSelect={handleVehicleSelect} />
    </>
  );
};

export default KmModal;
