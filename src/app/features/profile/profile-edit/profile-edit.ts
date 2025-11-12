import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../profile.service';
import { UserProfile } from '../../../core/user/user.model';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-edit',
  standalone: false,
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss'
})
export class ProfileEdit implements OnInit {

  form!: FormGroup;
  user!: UserProfile;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private profileSvc: ProfileService
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username')!;
    this.loadUser(username);
  }

  private loadUser(username: string): void {
    this.loading = true;
    this.profileSvc.getProfile(username).subscribe({
      next: (data) => {
        this.user = data.user;
        this.form = this.fb.group({
          displayName: [this.user.displayName, Validators.required],
          email: [this.user.email, [Validators.required, Validators.email]],
          bio: [this.user.bio]
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user profile for edit:', err);
        this.loading = false;
      }
    });
  }

  saveChanges(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.profileSvc.updateProfile(this.user.id, this.form.value).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.router.navigate(['/profile', this.user.username]);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile', this.user.username]);
  }

}
