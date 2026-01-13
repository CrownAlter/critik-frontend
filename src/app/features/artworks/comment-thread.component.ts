import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { UiModule } from '../../shared/ui/ui.module';
import { Comment } from '../../core/api/api.models';

/**
 * Renders a single comment and its nested replies.
 *
 * This component is recursive: it renders child `CommentThreadComponent`s for replies.
 * To avoid excessive nesting in the UI, we stop at `maxDepth`.
 */
@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiModule],
  template: `
    <div class="comment-node" [style.paddingLeft.px]="depth * 12">
      <div class="comment">
        <div class="comment-meta">
          <b>@{{ comment.user.username }}</b>
          <span class="timestamp">{{ formatDate(comment.createdAt) }}</span>
          <span class="spacer"></span>

          <button mat-button type="button" *ngIf="canReply" (click)="replyToggle.emit(comment.id)">
            Reply
          </button>

          <button
            mat-button
            color="warn"
            type="button"
            *ngIf="canDelete"
            (click)="delete.emit(comment.id)"
            [disabled]="busy"
          >
            Delete
          </button>
        </div>

        <div class="comment-text">{{ comment.commentText }}</div>

        <form *ngIf="replyOpen" class="reply-form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Reply</mat-label>
            <input 
              matInput 
              [formControl]="replyControl" 
              (keydown.enter)="onSubmitReply($event)"
            />
          </mat-form-field>
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="onSubmitReply($event)"
            [disabled]="busy || !replyControl.value.trim()"
          >
            Post
          </button>
        </form>
      </div>

      <!-- Reply section with view more functionality -->
      <div class="replies-section" *ngIf="comment.replies && comment.replies.length > 0">
        <!-- Show limited replies or all based on expanded state -->
        <ng-container *ngFor="let r of getVisibleReplies()">
          <app-comment-thread
            [comment]="r"
            [depth]="depth + 1"
            [maxDepth]="maxDepth"
            [busy]="busy"
            [canReply]="canReply"
            [canDelete]="canDeleteFn(r)"
            [replyOpen]="replyOpenFor(r.id)"
            [replyControl]="replyControlFor(r.id)"
            [replyOpenFor]="replyOpenFor"
            [replyControlFor]="replyControlFor"
            [canDeleteFn]="canDeleteFn"
            (replyToggle)="replyToggle.emit($event)"
            (postReply)="postReply.emit($event)"
            (delete)="delete.emit($event)"
          ></app-comment-thread>
        </ng-container>

        <!-- View More/Less Button -->
        <button
          mat-button
          type="button"
          *ngIf="shouldShowViewMore()"
          (click)="toggleExpanded()"
          class="view-more-btn"
        >
          {{ isExpanded ? 'View Less' : 'View More Replies' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .comment-node {
        border-left: 2px solid rgba(0, 0, 0, 0.08);
        padding-left: 0.75rem;
        margin-top: 0.75rem;
      }
      .comment {
        display: grid;
        gap: 0.25rem;
        background: #f8f9fa;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }
      .comment-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
      }
      .timestamp {
        opacity: 0.6;
        font-size: 0.75rem;
      }
      .comment-text {
        line-height: 1.4;
        word-wrap: break-word;
      }
      .reply-form {
        display: flex;
        gap: 0.5rem;
        align-items: start;
        margin-top: 0.5rem;
      }
      .full {
        flex: 1;
      }
      .spacer {
        flex: 1;
      }
      .replies-section {
        margin-top: 0.5rem;
      }
      .view-more-btn {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        text-transform: none;
        color: #1976d2;
      }
      @media (max-width: 600px) {
        .comment {
          padding: 0.5rem;
        }
        .comment-meta {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class CommentThreadComponent implements OnInit {
  @Input({ required: true }) comment!: Comment;

  /** Current nesting depth (0 = top-level). */
  @Input() depth = 0;

  /** Maximum depth to render (inclusive). */
  @Input() maxDepth = 3;

  @Input() busy = false;

  @Input() canReply = false;

  @Input() canDelete = false;

  @Input({ required: true }) replyOpen = false;

  @Input({ required: true }) replyControl!: FormControl<string>;

  /**
   * Functions are passed from parent so state is centralized in the page.
   */
  @Input({ required: true }) replyOpenFor!: (commentId: number) => boolean;

  @Input({ required: true }) replyControlFor!: (commentId: number) => FormControl<string>;

  @Input({ required: true }) canDeleteFn!: (comment: Comment) => boolean;

  @Output() replyToggle = new EventEmitter<number>();
  @Output() postReply = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  // Local state for view more functionality
  isExpanded = false;
  private readonly DEFAULT_VISIBLE_REPLIES = 2;

  ngOnInit(): void {
    // Auto-expand if there are only a few replies
    if (this.comment.replies && this.comment.replies.length <= this.DEFAULT_VISIBLE_REPLIES) {
      this.isExpanded = true;
    }
  }

  /**
   * Get visible replies based on expanded state
   */
  getVisibleReplies(): Comment[] {
    if (!this.comment.replies || this.comment.replies.length === 0) {
      return [];
    }

    if (this.isExpanded || this.comment.replies.length <= this.DEFAULT_VISIBLE_REPLIES) {
      return this.comment.replies;
    }

    return this.comment.replies.slice(0, this.DEFAULT_VISIBLE_REPLIES);
  }

  /**
   * Check if we should show the view more button
   */
  shouldShowViewMore(): boolean {
    return this.comment.replies && this.comment.replies.length > this.DEFAULT_VISIBLE_REPLIES;
  }

  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Handle reply form submission
   */
  onSubmitReply(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Only emit if reply has content
    if (this.replyControl.value.trim()) {
      this.postReply.emit(this.comment.id);
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
