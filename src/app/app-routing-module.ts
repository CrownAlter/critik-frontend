import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AuthRoutingModule } from './features/auth/auth-routing-module';
import { Search } from './features/search/search';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'artworks',
    loadChildren: () => import('./features/artworks/artworks-module').then((m) => m.ArtworksModule),
  },
  {
    path: 'artworks/:id',
    loadChildren: () =>
      import('./features/artwork-detail/artwork-detail-module').then((m) => m.ArtworkDetailModule),
  },
  { path: 'profile/:username', loadChildren: () => import('./features/profile/profile-module').then(m => m.ProfileModule) },
  { path: 'search', component: Search }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

export { routes };
