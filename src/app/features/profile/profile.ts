import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/user/user.service';
import { FollowService } from '../../core/follow/follow.service';
import { UserProfile } from '../../core/user/user.model';
import { ArtworkSummary } from '../artworks/artwork-model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Auth, LoginResponse } from '../../core/auth';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {

  username!: string;
  profileUser!: UserProfile;           // The actual user object from backend (profile.user)
  artworks: ArtworkSummary[] = [];     // List of artworks (profile.artworks)
  followers: UserProfile[] = [];
  following: UserProfile[] = [];


  loading = false;


  loggedInUsername: string | null = null;
  loggedInUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private userSvc: UserService,
    private followSvc: FollowService,
    private auth: Auth
  ) {}

  

  ngOnInit(): void {
    this.loggedInUsername = this.auth.getUsername();
    this.loggedInUserId = this.auth.getUserId();
    this.username = this.route.snapshot.paramMap.get('username')!;
    if (this.username) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
  this.loading = true;

  this.userSvc.getUserProfile(this.username).subscribe({
  next: (profileResponse: any) => {
    this.profileUser = profileResponse.user;
    this.profileUser.isFollowing = profileResponse.isFollowing; // 👈 add this

    this.artworks = profileResponse.artworks.map((a: { imageUrl: string }) => ({
      ...a,
      imageUrl: a.imageUrl.startsWith('http')
        ? a.imageUrl
        : `${environment.apiUrl}${a.imageUrl}`
    }));

    if (this.profileUser?.id) {
      this.loadFollowers(this.profileUser.id);
      this.loadFollowing(this.profileUser.id);
    }

    this.loading = false;
  },
  error: (err) => {
    console.error('Error loading profile:', err);
    this.loading = false;
  }
});

}


  private loadFollowers(userId: number): void {
    this.followSvc.getFollowers(userId).subscribe({
      next: (data) => (this.followers = data),
      error: (err) => console.error('Error fetching followers:', err)
    });
  }

  private loadFollowing(userId: number): void {
    this.followSvc.getFollowing(userId).subscribe({
      next: (data) => (this.following = data),
      error: (err) => console.error('Error fetching following:', err)
    });
  }
}
