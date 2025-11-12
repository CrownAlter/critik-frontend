import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowService } from '../../../core/follow/follow.service';

@Component({
  selector: 'app-follow-button',
  standalone: false,
  template: `
    <button 
      (click)="toggleFollow()" 
      [class.following]="isFollowing"
      [disabled]="!followerId"
      title="{{ !followerId ? 'Log in to follow users' : '' }}"
    >
      {{ isFollowing ? 'Unfollow' : 'Follow' }}
    </button>
  `,
  styleUrls: ['./follow-button.scss']
})
export class FollowButtonComponent implements OnInit {
  @Input() followerId: number | null = null;
  @Input() followedId!: number;
  @Input() isFollowing = false;

  @Output() followStatusChanged = new EventEmitter<boolean>();

  constructor(private followService: FollowService) {}

  ngOnInit(): void {}

  toggleFollow(): void {
    if (!this.followerId) return;

    if (this.isFollowing) {
      this.followService.unfollowUser(this.followerId, this.followedId).subscribe(() => {
        this.isFollowing = false;
        this.followStatusChanged.emit(this.isFollowing);
      });
    } else {
      this.followService.followUser(this.followerId, this.followedId).subscribe(() => {
        this.isFollowing = true;
        this.followStatusChanged.emit(this.isFollowing);
      });
    }
  }
}
