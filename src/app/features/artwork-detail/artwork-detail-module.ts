import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArtworkDetailRoutingModule } from './artwork-detail-routing-module';
import { ArtworkDetail } from './artwork-detail/artwork-detail';
import { SharedModule } from "../../shared/shared-module";


@NgModule({
  declarations: [
    ArtworkDetail
  ],
  imports: [
    CommonModule,
    ArtworkDetailRoutingModule,
    SharedModule
]
})
export class ArtworkDetailModule { }
