/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import "@angular/compiler"; // Import the JIT compiler

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
