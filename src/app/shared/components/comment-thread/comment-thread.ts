import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../../core/comment/comment.service';
import { Comment } from '../../../core/comment/comment.model';
import { catchError, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comment-thread',
  standalone: false,
  templateUrl: './comment-thread.html',
  styleUrls: ['./comment-thread.scss']
})



export class CommentThreadComponent implements OnInit {
  @Input() artworkId!: number;

  comments: Comment[] = [];
  loading = false;
  posting = false;
  error: string | null = null;

  form: FormGroup;

  constructor(private fb: FormBuilder, private comment: CommentService, private route: ActivatedRoute) {
    this.form = this.fb.group({ text: ['', [Validators.required, Validators.maxLength(1000)]] });
  }

ngOnInit() {
  this.route.parent?.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {
      this.artworkId = +id;
      this.loadComments();
    } else {
      console.error('No artworkId found in route!');
    }
  });
}




  loadComments() {
    if (!this.artworkId) return;

    this.loading = true;
    this.comment.getComments(this.artworkId)
      .pipe(catchError(() => {
        this.error = 'Failed to load comments';
        return of([]);
      }))
      .subscribe(comments => {
        this.comments = comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      });
  }

  post() {
    if (this.form.invalid) return;
    this.posting = true;
    const text = this.form.value.text.trim();
    this.comment.postComment(this.artworkId, text).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment); // optimistic append at top
        this.form.reset();
        this.posting = false;
      },
      error: () => { this.posting = false; /* show error */ }
    });
  }
  
}
