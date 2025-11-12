import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed';
import { MyArtworksComponent } from './my-artworks/my-artworks';
import { UploadComponent } from './upload/upload';

const routes: Routes = [
  { path: 'feed', component: FeedComponent },
  { path: 'my', component: MyArtworksComponent },
  { path: 'upload', component: UploadComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtworksRoutingModule {}
