import { Component, Input, OnInit } from '@angular/core';
import { ReactionService } from '../../../core/reaction/reaction.service';
import { ArtworkReactions, ReactionType } from '../../../core/reaction/reaction.model';
import { Auth } from '../../../core/auth';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-reaction-bar',
  standalone: false,
  templateUrl: './reaction-bar.html',
  styleUrls: ['./reaction-bar.scss']
})
export class ReactionBar implements OnInit {

   @Input() artworkId!: number;

  reactions: ArtworkReactions = { agree: 0, disagree: 0, userReaction: null };
  loading = false;
  error: string | null = null;

  constructor(private reactionSvc: ReactionService) {}

  ngOnInit() {
    this.loadReactions();
  }

  loadReactions() {
    if (!this.artworkId) return;
    this.loading = true;

    this.reactionSvc.getReactions(this.artworkId)
      .pipe(catchError(() => {
        this.error = 'Failed to load reactions';
        return of({ agree: 0, disagree: 0, userReaction: null });
      }))
      .subscribe(r => {
        this.reactions = r;
        this.loading = false;
      });
  }

  toggleReaction(type: ReactionType) {
    if (!this.artworkId) return;

    const current = this.reactions.userReaction;

    // Optimistic UI: adjust counts before backend response
    if (current === type) {
      // Remove reaction
      this.reactions.userReaction = null;
      this.reactions[type.toLowerCase() as 'agree' | 'disagree']--;
    } else {
      // Switch reaction or set new
      if (current) this.reactions[current.toLowerCase() as 'agree' | 'disagree']--;
      this.reactions[type.toLowerCase() as 'agree' | 'disagree']++;
      this.reactions.userReaction = type;
    }

    this.reactionSvc.setReaction(this.artworkId, type)
      .pipe(catchError(() => {
        this.error = 'Failed to set reaction';
        // Rollback counts if failed
        this.loadReactions();
        return of(null);
      }))
      .subscribe();
  }
}