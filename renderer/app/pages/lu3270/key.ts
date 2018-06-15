import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { HostBinding } from '@angular/core';
import { Input } from '@angular/core';

/**
 * Keyboard key component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-key',
  styleUrls: ['key.scss'],
  templateUrl: 'key.html'
})

export class KeyComponent {

  @HostBinding('class.disabled') @Input() disabled: boolean;
  @HostBinding('class.short') @Input() short: boolean;

  @Input() label: string;

}
