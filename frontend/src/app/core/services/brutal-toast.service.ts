import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class BrutalToastService {
  private snack = inject(MatSnackBar);

  success(message: string) {
    this.snack.open(message, 'OK', {
      duration: 3000,
      panelClass: ['brutal-success-toast'],
    });
  }

  error(message: string) {
    this.snack.open(message, 'Close', {
      duration: 4000,
      panelClass: ['brutal-error-toast'],
    });
  }
}