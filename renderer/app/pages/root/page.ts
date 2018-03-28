import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * EL-3270 Root
 */

@Component({
  selector: 'el3270-root',
  templateUrl: 'page.html',
  styleUrls: ['page.scss']
})

export class RootPageComponent {

  /** ctor */
  constructor(private router: Router) { }

  /** Connect to host */
  connect() {
    this.router.navigate(['lu3270']);
  }

  /** Disconnect from host */
  disconnect() {

  }

  /**  Show help panel */
  help() {
    this.router.navigate(['help']);
  }

}
