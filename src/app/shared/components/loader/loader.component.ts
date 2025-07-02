import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loader-container">
      <mat-progress-spinner
        [diameter]="diameter"
        [color]="color"
        mode="indeterminate">
      </mat-progress-spinner>
    </div>
  `,
    styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  @Input() diameter: number = 48;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
} 