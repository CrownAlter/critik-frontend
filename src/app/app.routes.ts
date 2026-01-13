import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { LoginPage } from './features/auth/login.page';
import { RegisterPage } from './features/auth/register.page';

// Feature pages (implemented incrementally)
import { FeedPage } from './features/feed/feed.page';
import { UploadArtworkPage } from './features/artworks/upload-artwork.page';
import { MyArtworksPage } from './features/artworks/my-artworks.page';
import { SearchPage } from './features/search/search.page';
import { ArtworkDetailPage } from './features/artworks/artwork-detail.page';
import { ProfilePage } from './features/profile/profile.page';
import { FollowersPage } from './features/social/followers.page';
import { FollowingPage } from './features/social/following.page';
import { EditProfilePage } from './features/profile/edit-profile.page';

/**
 * Application routes.
 */
export const routes: Routes = [
  { path: '', component: FeedPage },

  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },

  { path: 'upload', component: UploadArtworkPage, canActivate: [authGuard] },
  { path: 'my-artworks', component: MyArtworksPage, canActivate: [authGuard] },
  { path: 'search', component: SearchPage },

  { path: 'artworks/:id', component: ArtworkDetailPage },
  { path: 'users/:username', component: ProfilePage },
  { path: 'users/:userId/followers', component: FollowersPage, canActivate: [authGuard] },
  { path: 'users/:userId/following', component: FollowingPage, canActivate: [authGuard] },

  { path: 'me/edit-profile', component: EditProfilePage, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];
