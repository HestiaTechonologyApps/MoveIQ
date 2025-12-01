// src/components/KiduCommentModal.tsx

import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { FaComment } from "react-icons/fa6";
import toast from "react-hot-toast";
import CommentService from "../services/common/Comment.services";
import type { CreateCommentPayload } from "../types/common/Comment.types";

interface KiduCommentModalProps {
  show: boolean;
  handleClose: () => void;
  handleSuccess: () => void;
  tableName: string;
  recordId: number;
}

const KiduCommentModal: React.FC<KiduCommentModalProps> = ({
  show,
  handleClose,
  handleSuccess,
  tableName,
  recordId,
}) => {
  const [description, setDescription] = useState("");
  const [commentType, setcommentType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveClick = async () => {
    if (!description.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setLoading(true);
      const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload: CreateCommentPayload = {
        commentId: 0,
        commentType: commentType,
        description: description.trim(),
        tableName: tableName,
        recordID: recordId,
        parentCommentId: 0,
        isInternal: false,
        createdOn: new Date().toISOString(),
        createdBy: loggedUser.userEmail || loggedUser.userName || "User",
        isDeleted: false,
      };

      const res = await CommentService.create(payload);
      if (res.isSucess) {
        toast.success("Comment added successfully!");
        setDescription("");
        setcommentType("");
        handleSuccess();
        handleClose();
      } else {
        toast.error(res.customMessage || "Failed to add comment");
      }
    } catch (err: any) {
      console.error("Error saving comment:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setDescription("");
    setcommentType("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered className="head-font">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fs-5">
          <FaComment className="me-2" style={{ color: "#18575A" }} />
          Add Comment
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted mb-3">
          Add your comments, observations, or any important notes related to this record.
        </p>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" style={{ color: "#18575A" }} />
          </div>
        ) : (
          <Form>
            <Form.Group as={Row} className="align-items-start mb-3">
              <Form.Label column sm={3} className="fw-semibold">
                Type <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={9}>
                <Form.Select
                  value={commentType}
                  onChange={(e) => setcommentType(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="">Select Type</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Appreciation">Appreciation</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="align-items-start">
              <Form.Label column sm={3} className="fw-semibold">
                Comment <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter your comment here..."
                  className="shadow-sm"
                />
              </Col>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleModalClose}>
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: "#18575A", border: "none" }}
          onClick={handleSaveClick}
          disabled={!description.trim() || loading}
        >
          {loading ? "Saving..." : "Add Comment"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KiduCommentModal;