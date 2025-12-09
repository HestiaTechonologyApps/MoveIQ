import React from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";

interface AddDropLocationProps {
  values: string[];
  onChange: (values: string[]) => void;
}

const AddDropLocation: React.FC<AddDropLocationProps> = ({ values, onChange }) => {
  // FIX: Guarantee values is always an array
  const safeValues = Array.isArray(values) ? values : [""];

  const handleAddInput = () => {
    if (safeValues.length < 5) onChange([...safeValues, ""]);
  };

  const handleRemoveInput = (index: number) => {
    const newInputs = safeValues.filter((_, i) => i !== index);
    onChange(newInputs.length ? newInputs : [""]);
  };

  const handleChange = (index: number, value: string) => {
    const newInputs = [...safeValues];
    newInputs[index] = value;
    onChange(newInputs);
  };

  return (
    <>
      <Form.Label className="mb-2 fw-medium">Drop Locations</Form.Label>

      {safeValues.map((input, index) => (
        <Row key={index} className="mb-2">
          <Col xs={12}>
            <InputGroup size="sm" className="custom-input rounded">
              <InputGroup.Text>{index + 1}</InputGroup.Text>

              <Form.Control
                type="text"
                placeholder={`Drop location ${index + 1}`}
                maxLength={50} 
                className="p-2"
                value={input || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                style={{ backgroundColor: "#ffffffff" }}
              />

              <Button
                variant="light"
                onClick={() => handleRemoveInput(index)}
                disabled={safeValues.length === 1}
              >
                <BsTrash color="red" />
              </Button>
            </InputGroup>
          </Col>
        </Row>
      ))}

      {safeValues.length < 4 && (
        <Button
          variant="outline-success"
          size="sm"
          onClick={handleAddInput}
          className="mb-3 d-flex align-items-center gap-2"
        >
          <FaPlus /> Add Drop Location
        </Button>
      )}
    </>
  );
};

export default AddDropLocation;
