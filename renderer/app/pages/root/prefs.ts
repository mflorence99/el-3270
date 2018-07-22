import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { DrawerPanelComponent } from 'ellib';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../../state/prefs';
import { Validators } from '@angular/forms';

import { config } from '../../config';

/** 
 * Prefs component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'el3270-prefs',
  templateUrl: 'prefs.html',
  styleUrls: ['prefs.scss']
})

export class PrefsComponent extends LifecycleComponent {

  @Input() prefs = { } as PrefsStateModel;

  prefsForm: FormGroup;

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // create prefs form controls
    this.prefsForm = this.formBuilder.group({
      host: ['', Validators.required],
      port: ['', [
        Validators.required,
        Validators.min(config.portMin),
        Validators.max(config.portMax)]
      ],
      model: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('prefs') newState() {
    if (this.prefs)
      this.prefsForm.patchValue(this.prefs, { emitEvent: false });
  }

}
