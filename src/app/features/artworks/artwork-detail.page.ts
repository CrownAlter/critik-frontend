import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';

import { UiModule } from '../../shared/ui/ui.module';
import { CommentThreadComponent } from './comment-thread.component';
import {
  Artwork,
  Comment,
  ReactionCounts,
  ReactionType,
  UserReactionResponse,
} from '../../core/api/api.models';
import { toAbsoluteApiUrl } from '../../core/api/api.util';
import { ArtworksApi } from '../../core/api/artworks.api';
import { CommentsApi } from '../../core/api/comments.api';
import { ReactionsApi } from '../../core/api/reactions.api';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Artwork detail page.
 *
 * Backend:
 * - GET `/artworks/{id}`
 * - GET `/artworks/{id}/comments`
 * - reactions endpoints
 */
@Component({
  selector: 'app-artwork-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, UiModule, CommentThreadComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Artwork</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="loading()" class="center">
          <mat-progress-spinner diameter="28"></mat-progress-spinner>
        </div>

        <div *ngIf="error()" class="error">{{ error() }}</div>

        <ng-container *ngIf="artwork() as a">
          <div class="top">
            <img class="hero" [src]="img(a.imageUrl)" [alt]="a.title" />

            <div class="info">
              <h2 class="title">{{ a.title }}</h2>
              <div class="meta">
                by
                <a [routerLink]="['/users', a.user.username]">@{{ a.user.username }}</a>
              </div>

              <div class="meta" *ngIf="a.artistName">Artist: {{ a.artistName }}</div>
              <div class="meta" *ngIf="a.locationName">Location: {{ a.locationName }}</div>
              <p *ngIf="a.interpretation">{{ a.interpretation }}</p>

              <div class="owner-actions" *ngIf="isOwner(a)">
                <button mat-stroked-button type="button" (click)="toggleEdit()">
                  {{ editMode() ? 'Cancel edit' : 'Edit' }}
                </button>
                <button
                  mat-stroked-button
                  color="warn"
                  type="button"
                  (click)="deleteArtwork()"
                  [disabled]="editBusy()"
                >
                  Delete
                </button>
              </div>

              <form
                *ngIf="editMode()"
                class="edit-form"
                [formGroup]="editForm"
                (ngSubmit)="saveEdit()"
              >
                <mat-form-field appearance="outline" class="full">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full">
                  <mat-label>Artist name</mat-label>
                  <input matInput formControlName="artistName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full">
                  <mat-label>Location name</mat-label>
                  <input matInput formControlName="locationName" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Latitude</mat-label>
                  <input matInput type="number" formControlName="lat" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Longitude</mat-label>
                  <input matInput type="number" formControlName="lon" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full">
                  <mat-label>Interpretation</mat-label>
                  <input matInput formControlName="interpretation" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full">
                  <mat-label>Tags</mat-label>
                  <input matInput formControlName="tags" />
                </mat-form-field>

                <div class="edit-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="editForm.invalid || editBusy()"
                  >
                    Save
                  </button>
                </div>
              </form>

              <div class="reactions">
                <button
                  mat-stroked-button
                  color="primary"
                  type="button"
                  (click)="setReaction('AGREE')"
                  [disabled]="!isAuthed() || reactionBusy()"
                >
                  Agree ({{ counts()['AGREE'] || 0 }})
                </button>

                <button
                  mat-stroked-button
                  color="warn"
                  type="button"
                  (click)="setReaction('DISAGREE')"
                  [disabled]="!isAuthed() || reactionBusy()"
                >
                  Disagree ({{ counts()['DISAGREE'] || 0 }})
                </button>

                <button
                  mat-button
                  type="button"
                  (click)="clearReaction()"
                  *ngIf="isAuthed() && myReaction()?.hasReaction"
                  [disabled]="reactionBusy()"
                >
                  Clear
                </button>

                <span class="hint" *ngIf="!isAuthed()">Login to react.</span>
              </div>
            </div>
          </div>

          <h3>Comments</h3>

          <form
            *ngIf="isAuthed()"
            [formGroup]="commentForm"
            (ngSubmit)="postComment()"
            class="comment-form"
          >
            <mat-form-field appearance="outline" class="full">
              <mat-label>Add a comment</mat-label>
              <input matInput formControlName="text" />
            </mat-form-field>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="commentForm.invalid || commentBusy()"
            >
              Post
            </button>
          </form>

          <div *ngIf="!isAuthed()" class="hint">Login to comment.</div>

          <div *ngIf="commentsLoading()" class="center">
            <mat-progress-spinner diameter="28"></mat-progress-spinner>
          </div>

          <div *ngIf="comments().length" class="comment-tree">
            <ng-container *ngFor="let c of comments()">
              <app-comment-thread
                [comment]="c"
                [depth]="0"
                [maxDepth]="3"
                [busy]="commentBusy()"
                [canReply]="isAuthed()"
                [canDelete]="canDelete(c)"
                [replyOpen]="replyOpenFor(c.id)"
                [replyControl]="replyControl(c.id)"
                [replyOpenFor]="replyOpenFor.bind(this)"
                [replyControlFor]="replyControl.bind(this)"
                [canDeleteFn]="canDelete.bind(this)"
                (replyToggle)="toggleReply($event)"
                (postReply)="postReply($event)"
                (delete)="deleteComment($event)"
              ></app-comment-thread>
            </ng-container>
          </div>

          <div *ngIf="!commentsLoading() && !comments().length" class="hint">No comments yet.</div>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .center {
        display: flex;
        justify-content: center;
        padding: 1rem;
      }
      .error {
        color: #b00020;
        padding: 0.5rem 0;
      }
      .top {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        align-items: start;
        margin-bottom: 1rem;
      }
      .hero {
        width: 100%;
        border-radius: 8px;
        object-fit: cover;
      }
      .title {
        margin: 0;
      }
      .meta {
        opacity: 0.8;
      }
      .owner-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
      }
      .edit-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }
      .edit-actions {
        grid-column: 1 / -1;
      }
      .reactions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
      }
      .hint {
        opacity: 0.7;
      }
      .comment-form {
        display: flex;
        gap: 0.5rem;
        align-items: start;
        margin-bottom: 0.75rem;
      }
      .full {
        flex: 1;
      }
      .comment-tree {
        display: grid;
        gap: 0.75rem;
      }
      @media (max-width: 900px) {
        .top {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ArtworkDetailPage implements OnInit {
  private artworkId: number | null = null;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly artwork = signal<Artwork | null>(null);

  protected readonly counts = signal<ReactionCounts>({});

  // Owner tools.
  protected readonly editMode = signal(false);
  protected readonly editBusy = signal(false);

  protected readonly myReaction = signal<UserReactionResponse | null>(null);
  protected readonly reactionBusy = signal(false);

  protected readonly commentsLoading = signal(true);
  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentBusy = signal(false);

  // Reply UI state (kept local to this page).
  protected readonly replyOpen = signal<Record<number, boolean>>({});
  protected readonly replyControls = new Map<number, FormControl<string>>();

  protected readonly isAuthed = computed(() => this.auth.isAuthenticated());

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly commentForm = this.fb.group({
    text: this.fb.control('', { validators: [Validators.required, Validators.minLength(1)] }),
  });

  /**
   * Owner edit form mirrors the backend's update map:
   * - title, artistName, locationName, lat, lon, interpretation, tags
   */
  protected readonly editForm = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.minLength(1)] }),
    artistName: this.fb.control(''),
    locationName: this.fb.control(''),
    lat: this.fb.control<number | null>(null),
    lon: this.fb.control<number | null>(null),
    interpretation: this.fb.control(''),
    tags: this.fb.control(''),
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly artworksApi: ArtworksApi,
    private readonly commentsApi: CommentsApi,
    private readonly reactionsApi: ReactionsApi,
    private readonly auth: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.artworkId = raw ? Number(raw) : null;

    if (!this.artworkId || Number.isNaN(this.artworkId)) {
      this.error.set('Invalid artwork id');
      this.loading.set(false);
      return;
    }

    this.loadArtwork(this.artworkId);
    this.loadComments(this.artworkId);
    this.loadReactions(this.artworkId);
  }

  private loadArtwork(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.artworksApi.getById(id).subscribe({
      next: (a) => {
        this.artwork.set(a);

        // Keep edit form in sync (only when not actively editing).
        if (!this.editMode()) {
          this.editForm.reset({
            title: a.title,
            artistName: a.artistName ?? '',
            locationName: a.locationName ?? '',
            lat: a.locationLat ?? null,
            lon: a.locationLon ?? null,
            interpretation: a.interpretation ?? '',
            tags: a.tags ?? '',
          });
        }

        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Failed to load artwork');
        this.loading.set(false);
      },
    });
  }

  private loadComments(id: number): void {
    this.commentsLoading.set(true);
    this.commentsApi.list(id).subscribe({
      next: (c) => {
        this.comments.set(c);
        this.commentsLoading.set(false);
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Failed to load comments', 'Dismiss', {
          duration: 3000,
        });
        this.commentsLoading.set(false);
      },
    });
  }

  private loadReactions(id: number): void {
    this.reactionsApi.counts(id).subscribe({
      next: (c) => this.counts.set(c),
      error: () => this.counts.set({}),
    });

    if (this.auth.isAuthenticated()) {
      this.reactionsApi.me(id).subscribe({
        next: (r) => this.myReaction.set(r),
        error: () => this.myReaction.set(null),
      });
    }
  }

  setReaction(type: ReactionType): void {
    if (!this.artworkId) return;
    if (!this.auth.isAuthenticated()) {
      this.snackBar.open('Please login to react', 'Dismiss', { duration: 2500 });
      return;
    }

    this.reactionBusy.set(true);
    this.reactionsApi.set(this.artworkId, type).subscribe({
      next: () => {
        this.snackBar.open(`Reaction: ${type}`, 'Dismiss', { duration: 1500 });
        this.myReaction.set({ hasReaction: true, type });
        this.loadReactions(this.artworkId!);
        this.reactionBusy.set(false);
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Failed to react', 'Dismiss', { duration: 2500 });
        this.reactionBusy.set(false);
      },
    });
  }

  clearReaction(): void {
    if (!this.artworkId) return;
    this.reactionBusy.set(true);

    this.reactionsApi.remove(this.artworkId).subscribe({
      next: () => {
        this.myReaction.set({ hasReaction: false, type: null });
        this.loadReactions(this.artworkId!);
        this.reactionBusy.set(false);
      },
      error: () => {
        this.reactionBusy.set(false);
      },
    });
  }

  replyOpenFor(commentId: number): boolean {
    return !!this.replyOpen()[commentId];
  }

  toggleReply(commentId: number): void {
    if (!this.auth.isAuthenticated()) {
      this.snackBar.open('Please login to reply', 'Dismiss', { duration: 2500 });
      return;
    }

    this.replyOpen.update((m) => ({ ...m, [commentId]: !m[commentId] }));
  }

  replyControl(commentId: number): FormControl<string> {
    let ctrl = this.replyControls.get(commentId);
    if (!ctrl) {
      ctrl = new FormControl('', { nonNullable: true });
      this.replyControls.set(commentId, ctrl);
    }
    return ctrl;
  }

  postReply(parentCommentId: number): void {
    if (!this.artworkId) return;

    const text = this.replyControl(parentCommentId).value.trim();
    if (!text) {
      this.snackBar.open('Reply cannot be empty', 'Dismiss', { duration: 2000 });
      return;
    }

    this.commentBusy.set(true);

    this.commentsApi.reply(this.artworkId, parentCommentId, text).subscribe({
      next: () => {
        this.replyControl(parentCommentId).setValue('');
        this.replyOpen.update((m) => ({ ...m, [parentCommentId]: false }));
        this.loadComments(this.artworkId!);
        this.commentBusy.set(false);
        this.snackBar.open('Reply posted', 'Dismiss', { duration: 1500 });
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Failed to post reply', 'Dismiss', {
          duration: 2500,
        });
        this.commentBusy.set(false);
      },
    });
  }

  canDelete(c: Comment): boolean {
    if (!this.auth.isAuthenticated()) return false;
    const me = this.auth.getCurrentUsername();
    return !!me && c.user.username === me;
  }

  deleteComment(commentId: number): void {
    if (!this.artworkId) return;

    this.commentBusy.set(true);
    this.commentsApi.delete(this.artworkId, commentId).subscribe({
      next: (res) => {
        this.snackBar.open(res.message ?? 'Deleted', 'Dismiss', { duration: 2000 });
        this.loadComments(this.artworkId!);
        this.commentBusy.set(false);
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Failed to delete', 'Dismiss', { duration: 2500 });
        this.commentBusy.set(false);
      },
    });
  }

  isOwner(a: Artwork): boolean {
    const me = this.auth.getCurrentUsername();
    return !!me && a.user.username === me;
  }

  toggleEdit(): void {
    this.editMode.update((v) => !v);

    // When enabling edit mode, seed the form with the current artwork.
    const a = this.artwork();
    if (this.editMode() && a) {
      this.editForm.reset({
        title: a.title,
        artistName: a.artistName ?? '',
        locationName: a.locationName ?? '',
        lat: a.locationLat ?? null,
        lon: a.locationLon ?? null,
        interpretation: a.interpretation ?? '',
        tags: a.tags ?? '',
      });
    }
  }

  saveEdit(): void {
    if (!this.artworkId) return;
    const a = this.artwork();
    if (!a) return;
    if (!this.isOwner(a)) return;

    const v = this.editForm.getRawValue();

    this.editBusy.set(true);

    this.artworksApi
      .update(this.artworkId, {
        title: v.title,
        artistName: v.artistName || null,
        locationName: v.locationName || null,
        lat: v.lat,
        lon: v.lon,
        interpretation: v.interpretation || null,
        tags: v.tags || null,
      })
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Artwork updated', 'Dismiss', { duration: 2500 });
          this.artwork.set(updated);
          this.editMode.set(false);
          this.editBusy.set(false);
        },
        error: (e) => {
          this.snackBar.open(e?.error?.message ?? 'Update failed', 'Dismiss', { duration: 3000 });
          this.editBusy.set(false);
        },
      });
  }

  deleteArtwork(): void {
    if (!this.artworkId) return;
    const a = this.artwork();
    if (!a) return;
    if (!this.isOwner(a)) return;

    this.editBusy.set(true);

    this.artworksApi.delete(this.artworkId).subscribe({
      next: (res) => {
        this.snackBar.open(res.message ?? 'Deleted', 'Dismiss', { duration: 2500 });
        this.editBusy.set(false);
        this.router.navigate(['/my-artworks']);
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Dismiss', { duration: 3000 });
        this.editBusy.set(false);
      },
    });
  }

  postComment(): void {
    if (!this.artworkId) return;

    const text = this.commentForm.getRawValue().text.trim();
    if (!text) {
      this.snackBar.open('Comment cannot be empty', 'Dismiss', { duration: 2000 });
      return;
    }

    this.commentBusy.set(true);
    this.commentsApi.add(this.artworkId, text).subscribe({
      next: () => {
        this.commentForm.reset({ text: '' });
        this.loadComments(this.artworkId!);
        this.commentBusy.set(false);
        this.snackBar.open('Comment posted', 'Dismiss', { duration: 1500 });
      },
      error: (e) => {
        this.snackBar.open(e?.error?.message ?? 'Failed to post comment', 'Dismiss', {
          duration: 2500,
        });
        this.commentBusy.set(false);
      },
    });
  }

  img(path: string): string {
    return toAbsoluteApiUrl(path);
  }
}
