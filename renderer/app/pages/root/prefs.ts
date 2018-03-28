import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DrawerPanelComponent } from 'ellib/lib/components/drawer-panel';

/**
 * Prefs component
 */

@Component({
  selector: 'el3270-prefs',
  templateUrl: 'prefs.html',
  styleUrls: ['prefs.scss']
})

export class PrefsComponent implements OnInit {

  prefsForm: FormGroup;

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) { }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

  // lifecycle methods

  ngOnInit() {
    this.prefsForm = this.formBuilder.group({
      host: ['', Validators.required],
      port: ['', [Validators.required, Validators.min(23), Validators.max(65535)]],
      model: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

}
