import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.darkThemeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkTheme(true);
    }
  }

  toggleTheme() {
    this.setDarkTheme(!this.darkThemeSubject.value);
  }

  private setDarkTheme(isDark: boolean) {
    this.darkThemeSubject.next(isDark);
    const html = document.documentElement;
    const body = document.body;
    if (isDark) {
      html.classList.add('dark-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
