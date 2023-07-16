import { NgFor } from '@angular/common';
import { Component, Input, computed, effect, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

type TodoItem = {
    complete: boolean;
    id: string;
    content: string;
    editing: boolean;
};

@Component({
    standalone: true,
    template: `
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input
                    class="new-todo"
                    placeholder="What needs to be done?"
                    autofocus
                    (keyup.enter)="addTodo($event)"
                />
            </header>
            <section class="main">
                <input id="toggle-all" class="toggle-all" type="checkbox" (change)="toggleAll()" />
                <label for="toggle-all">Mark all as complete</label>
                <ul class="todo-list">
                    <li
                        *ngFor="let todo of filteredTodos()"
                        [class.completed]="todo.complete"
                        [class.editing]="todo.editing"
                    >
                        <div class="view">
                            <input class="toggle" type="checkbox" [checked]="todo.complete" (change)="toggle(todo)" />
                            <label (dblclick)="toggleEditMode(todo)">{{ todo.content }}</label>
                            <button class="destroy" (click)="deleteTodo(todo)"></button>
                        </div>
                        <input class="edit" [value]="todo.content" (keyup.enter)="updateTodo($event, todo)" />
                    </li>
                </ul>
            </section>
            <footer class="footer">
                <span class="todo-count">
                    <strong>{{ activeTodos().length }}</strong>
                    {{ activeTodos().length <= 1 ? 'item' : 'items' }} left
                </span>
                <ul class="filters">
                    <li *ngFor="let filterType of ['All', 'Active', 'Completed']">
                        <a
                            [class.selected]="filter() === filterType"
                            [routerLink]="[]"
                            [queryParams]="filterType === 'All' ? null : { f: filterType }"
                        >
                            {{ filterType }}
                        </a>
                    </li>
                </ul>
                <button
                    class="clear-completed"
                    [hidden]="activeTodos().length === allTodos().length"
                    (click)="clearComplete()"
                >
                    Clear completed
                </button>
            </footer>
        </section>
        <footer class="info">
            <p>Double-click to edit a todo</p>
            <p>
                Created by
                <a href="http://github.com/nartc/ng-minimal-todomvc">Chau</a>
            </p>
            <p>
                Part of
                <a href="http://todomvc.com">TodoMVC</a>
            </p>
        </footer>
    `,
    imports: [NgFor, RouterLink],
})
export default class Todo {
    todos = signal<Record<string, TodoItem>>({});
    filter = signal<'All' | 'Completed' | 'Active'>('All');

    allTodos = computed(() => Object.values(this.todos()));
    activeTodos = computed(() => this.allTodos().filter((item) => !item.complete));
    filteredTodos = computed(() => {
        switch (this.filter()) {
            case 'All':
                return this.allTodos();
            case 'Completed':
                return this.allTodos().filter((item) => item.complete);
            case 'Active':
                return this.activeTodos();
        }
    });

    @Input() set f(q: ReturnType<typeof Todo.prototype.filter> | undefined) {
        this.filter.set(q || 'All');
    }

    constructor() {
        const todosString = localStorage.getItem('ng_minimal_todos');
        if (todosString) {
            JSON.parse(todosString).forEach((todo: TodoItem) => {
                this.todos.mutate((s) => (s[todo.id] = { ...todo, editing: false }));
            });
        }
        effect(() => {
            localStorage.setItem('ng_minimal_todos', JSON.stringify(this.allTodos()));
        });
    }

    addTodo(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
        if (!value) return;
        this.todos.mutate((s) => {
            const id = Date.now().toString();
            s[id] = { content: value, id, complete: false, editing: false };
        });
        input.value = '';
    }

    updateTodo(event: Event, todo: TodoItem) {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();

        if (!value) return;
        this.todos.mutate((s) => {
            s[todo.id].content = value;
            s[todo.id].editing = false;
        });
    }

    deleteTodo(todo: TodoItem) {
        this.todos.mutate((s) => {
            delete s[todo.id];
        });
    }

    toggle(todo: TodoItem) {
        this.todos.mutate((s) => {
            s[todo.id].complete = !s[todo.id].complete;
        });
    }

    toggleEditMode(todo: TodoItem) {
        this.todos.mutate((s) => {
            s[todo.id].editing = true;
        });
    }

    toggleAll() {
        const hasIncomplete = this.allTodos().some((todo) => !todo.complete);
        this.todos.mutate((s) => {
            Object.values(s).forEach((todo) => {
                todo.complete = hasIncomplete;
            });
        });
    }

    clearComplete() {
        this.todos.mutate((s) => {
            Object.values(s).forEach((todo) => {
                if (todo.complete) {
                    delete s[todo.id];
                }
            });
        });
    }
}

@Component({
    selector: 'app-root',
    standalone: true,
    template: '<router-outlet />',
    imports: [RouterOutlet],
})
export class App {}
