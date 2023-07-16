import { NgZone, ɵNoopNgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Todo, { App } from './app/app';

bootstrapApplication(App, {
    providers: [
        provideRouter([{ path: '', component: Todo }], withComponentInputBinding()),
        { provide: NgZone, useClass: ɵNoopNgZone },
    ],
}).catch((err) => console.error(err));
