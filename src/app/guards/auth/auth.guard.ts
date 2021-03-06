import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {Storage} from '@ionic/storage';
import {AuthService} from '../../services/auth/auth.service';
import {User} from '../../models/user';
import {OnboardPage} from '../../pages/onboard/onboard.page';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: Storage
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('auth guard');

    const needUser = next.data['needUser'];

    // check authentication state
    if (!this.auth.user) {
      return this.storage.get(AuthService.KEY_USER)
        .then((val) => {
          if (val) {
            // current user existing
            this.auth.user = new User().deserialize(val);

            return this.gotoNext(needUser);
          }

          // no user
          return this.gotoNext(needUser);
        })
        .catch((err) => {
          console.log(err);

          // no user
          return this.gotoNext(needUser);
        });
    }

    // user existing
    return this.gotoNext(needUser);
  }

  gotoNext(needUser): Promise<boolean> | boolean {
    if (this.auth.user) {
      if (needUser) {
        return Promise.resolve(true);
      }

      // user is existing, redirect to main page
      this.router.navigate(['/tabs/home']);
      return false;
    } else {
      if (!needUser) {
        return Promise.resolve(true);
      }

      // user is not existing, redirect to sign up page
      return this.showOnboard();
    }
  }

  showOnboard() {
    //
    // check onboard shown status
    //
    return this.storage.get(OnboardPage.KEY_SHOWN)
      .then((shown) => {
        if (shown) {
          this.router.navigate(['onboard']);
        }

        this.router.navigate(['signup-email']);
        return Promise.resolve(false);
      })
      .catch((err) => {
        console.log(err);

        this.router.navigate(['signup-email']);
        return Promise.resolve(false);
      });
  }
}
