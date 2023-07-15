import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { App } from './app/app';
import Todo from './app/todo';

bootstrapApplication(App, {
    providers: [provideRouter([{ path: '', component: Todo }], withComponentInputBinding())],
}).catch((err) => console.error(err));
