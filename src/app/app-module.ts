import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './features/home/home';
import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';
import { AuthModule } from './features/auth/auth-module';
import { FollowButtonComponent } from './shared/components/follow-button/follow-button';
import { Search } from './features/search/search';
import { FormsModule } from '@angular/forms';
import { AuthDialog } from './features/auth-dialog/auth-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    App,
    Home,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    AuthModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [
    // provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(),
    // provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
