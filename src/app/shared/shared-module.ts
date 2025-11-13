import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Navbar } from './navbar/navbar';
import { RouterModule } from '@angular/router';
import { ReactionBar } from './components/reaction-bar/reaction-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentThreadComponent } from './components/comment-thread/comment-thread';
import { AuthDialog } from '../features/auth-dialog/auth-dialog';
import { Search } from '../features/search/search';
import { FormsModule } from '@angular/forms';
import { Toast } from './ui/toast/toast';


@NgModule({
  declarations: [
    Navbar,
    ReactionBar,
    CommentThreadComponent,
    AuthDialog,
    Search,
    Toast
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    Navbar,
    ReactionBar,
    CommentThreadComponent
  ]
})
export class SharedModule { }
