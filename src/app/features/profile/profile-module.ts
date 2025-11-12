import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Profile } from './profile';
import { FollowButtonComponent } from '../../shared/components/follow-button/follow-button';
import { ProfileEdit } from './profile-edit/profile-edit';// adjust path if needed
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: Profile },
  { path: 'edit', component: ProfileEdit }
];

@NgModule({
  declarations: [Profile, FollowButtonComponent, ProfileEdit],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ]
})
export class ProfileModule {}
