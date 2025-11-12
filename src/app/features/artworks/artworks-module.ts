import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ArtworksRoutingModule } from './artworks-routing-module';
import { FeedComponent } from './feed/feed';
import { MyArtworksComponent } from './my-artworks/my-artworks';
import { UploadComponent } from './upload/upload';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FeedComponent,
    MyArtworksComponent,
    UploadComponent
  ],
  imports: [
    CommonModule,
    ArtworksRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ArtworksModule { }
