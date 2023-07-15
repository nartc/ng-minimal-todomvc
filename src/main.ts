import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

bootstrapApplication(App, { providers: [] }).catch((err) => console.error(err));
