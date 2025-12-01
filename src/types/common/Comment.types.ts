// src/types/common/Comment.types.ts

export interface Comment {
  commentId: number;
  commentType:string;
  description: string;
  tableName: string;
  recordID: number;
  parentCommentId?: number;
  isInternal: boolean;
  createdOn: string;
  createdBy: string;
  isDeleted: boolean;
  deletedOn?: string;
  deletedBy?: string;
}

export interface CommentResponse {
  statusCode: number;
  error: string | null;
  customMessage: string;
  isSucess: boolean;
  value: Comment[] | Comment;
}

export interface CreateCommentPayload {
  commentId?: number;
  commentType:string;
  description: string;
  tableName: string;
  recordID: number;
  parentCommentId?: number;
  isInternal?: boolean;
  createdOn: string;
  createdBy: string;
  isDeleted?: boolean;
  deletedOn?: string;
  deletedBy?: string;
}