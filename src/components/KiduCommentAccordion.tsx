// src/components/KiduCommentAccordion.tsx

import React, { useEffect, useState } from "react";
import { Accordion, Card, Spinner, Alert, Button } from "react-bootstrap";
import { FaComment, FaTrash, FaPlus } from "react-icons/fa6";
import toast from "react-hot-toast";
import CommentService from "../services/common/Comment.services";
import type { Comment } from "../types/common/Comment.types";
import KiduCommentModal from "./KiduCommentsModal";

interface KiduCommentAccordionProps {
    tableName: string;
    recordId: string | number;
}

const PRIMARY_COLOR = "#18575A";
const KiduCommentAccordion: React.FC<KiduCommentAccordionProps> = ({
    tableName,
    recordId
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (tableName && recordId) {
            fetchComments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableName, recordId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await CommentService.getByTableAndId(tableName, recordId);

            if (data.isSucess && Array.isArray(data.value)) {
                setComments(data.value.filter(c => !c.isDeleted));
            } else if (data.isSucess && data.value && !Array.isArray(data.value)) {
                setComments([data.value].filter(c => !c.isDeleted));
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
            setError("Failed to load comments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (CommentId: number) => {
        try {
            setDeletingId(CommentId);

            const deletedBy = localStorage.getItem("username") || "User";
            const res = await CommentService.delete(CommentId, deletedBy);
            console.log(res);


            if (res.isSucess) {
                toast.success("Comment deleted successfully!");
                fetchComments();
            } else {
                toast.error(res.customMessage || "Failed to delete comment");
            }
        } catch (err: any) {
            console.error("Failed to delete comment:", err);
            toast.error(err.message || "Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDateSafe = (isoOrAny?: string) => {
        if (!isoOrAny) return "—";
        const d = new Date(isoOrAny);
        if (isNaN(d.getTime())) return isoOrAny;

        return d.toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <>
            <Accordion className="mt-4 custom-accordion">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <h6 className="mb-0 fw-bold head-font d-flex align-items-center" style={{ color: PRIMARY_COLOR }}>
                           
                            Comments ({comments.length})
                        </h6>
                    </Accordion.Header>

                    <Accordion.Body>
                        <Card
                            style={{
                                maxWidth: "100%",
                                fontSize: "0.85rem",
                                backgroundColor: "#f0f0f0ff",
                                border: "1px solid #ccc",
                                borderRadius: "0.5rem",
                            }}
                            className="shadow-sm"
                        >
                            <Card.Body style={{ padding: "1rem" }} className="border border-1 m-2">
                                <div className="d-flex justify-content-end mb-3">
                                    <Button
                                        size="sm"
                                        style={{ backgroundColor: "#18575A", border: "none" }}
                                        onClick={() => setShowModal(true)}
                                    >
                                        <FaPlus className="me-1" />
                                        Comment
                                    </Button>
                                </div>
                                {loading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" style={{ color: "#18575A" }} />
                                        <p className="mt-2 text-muted">Loading comments...</p>
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger">{error}</Alert>
                                )  : (
                                    <Accordion alwaysOpen>
                                        {comments.map((comment, idx) => (
                                            <Accordion.Item eventKey={idx.toString()} key={comment.commentId}>
                                                <Accordion.Header>
                                                    <div className="head-font d-flex flex-column flex-sm-row justify-content-between w-100 pe-3">
                                                        <span className="fw-medium fst-italic fs-6 head-font">
                                                            <FaComment className="me-2" size={14} />
                                                            by {comment.createdBy}
                                                        </span>
                                                        <small className="text-muted head-font">
                                                            {formatDateSafe(comment.createdOn)}
                                                        </small>
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div>
                                                                {/* <strong className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                                    Comment ID: {comment.commentId}
                                                                </strong> */}
                                                            </div>
                                                            <div className="p-3 rounded border" style={{backgroundColor: "#18575a18"}}>
                                                                <p className="mb-0 fw-bold" style={{ whiteSpace: "pre-wrap" }}> <span className="fw-bolder text-dark" style={{fontSize:"15px"}}>
                                                                    {comment.commentType} : </span>{comment.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="ms-3 mt-2"
                                                            onClick={() => handleDeleteComment(comment.commentId)}
                                                            disabled={deletingId === comment.commentId}
                                                            title="Delete comment"
                                                        >
                                                            {deletingId === comment.commentId ? (
                                                                <Spinner animation="border" size="sm" />
                                                            ) : (
                                                                <FaTrash />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                )}
                            </Card.Body>
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Comment Modal */}
            <KiduCommentModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSuccess={fetchComments}
                tableName={tableName}
                recordId={Number(recordId)}
            />

            <style>{`
        .custom-comment-header.accordion-button {
          background-color: #18575A !important;
          color: white !important;
          box-shadow: none !important;
        }
        .custom-comment-header.accordion-button:not(.collapsed) {
          background-color: #18575A !important;
          color: white !important;
        }
        .custom-comment-header.accordion-button::after {
          filter: invert(1);
        }
      `}</style>
        </>
    );
};

export default KiduCommentAccordion;