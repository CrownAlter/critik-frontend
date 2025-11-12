import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtworkDetail } from './artwork-detail/artwork-detail';
import { CommentThreadComponent } from '../../shared/components/comment-thread/comment-thread';

const routes: Routes = [
  { path: '', component: ArtworkDetail },
  { path: 'comments', component: CommentThreadComponent } // loads when /artworks/:id
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtworkDetailRoutingModule { }
