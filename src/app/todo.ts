import { NgFor, TitleCasePipe } from '@angular/common';
import { Component, Input, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type TodoItem = {
    complete: boolean;
    id: string;
    content: string;
    editing: boolean;
};

const todos = signal<Record<string, TodoItem>>({});
const filter = signal<'all' | 'completed' | 'active'>('all');

const allTodos = computed(() => Object.values(todos()));
const activeTodos = computed(() => allTodos().filter((item) => !item.complete));
const filteredTodos = computed(() => {
    switch (filter()) {
        case 'all':
            return allTodos();
        case 'completed':
            return allTodos().filter((item) => item.complete);
        case 'active':
            return activeTodos();
    }
});

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
            <!-- This section should be hidden by default and shown when there are todos -->
            <section class="main">
                <input id="toggle-all" class="toggle-all" type="checkbox" (change)="toggleAll()" />
                <label for="toggle-all">Mark all as complete</label>
                <ul class="todo-list">
                    <li *ngFor="let todo of todos()" [class.completed]="todo.complete" [class.editing]="todo.editing">
                        <div class="view">
                            <input class="toggle" type="checkbox" [checked]="todo.complete" (change)="toggle(todo)" />
                            <label (dblclick)="toggleEditMode(todo)">{{ todo.content }}</label>
                            <button class="destroy" (click)="deleteTodo(todo)"></button>
                        </div>
                        <input
                            [hidden]="!todo.editing"
                            (keyup.enter)="updateTodo($event, todo)"
                            class="edit"
                            [value]="todo.content"
                        />
                    </li>
                </ul>
            </section>
            <!-- This footer should be hidden by default and shown when there are todos -->
            <footer class="footer">
                <!-- This should be 0 items left by default -->
                <span class="todo-count">
                    <strong>{{ activeTodos().length }}</strong>
                    {{ activeTodos().length <= 1 ? 'item' : 'items' }} left
                </span>
                <!-- Remove this if you don't implement routing -->
                <ul class="filters">
                    <li *ngFor="let filterType of ['all', 'active', 'completed']">
                        <a
                            [class.selected]="filter() === filterType"
                            [routerLink]="[]"
                            [queryParams]="filterType === 'all' ? null : { f: filterType }"
                        >
                            {{ filterType | titlecase }}
                        </a>
                    </li>
                </ul>
                <!-- Hidden if no completed items are left ↓ -->
                <button class="clear-completed" (click)="clearComplete()">Clear completed</button>
            </footer>
        </section>
        <footer class="info">
            <p>Double-click to edit a todo</p>
            <!-- Remove the below line ↓ -->
            <p>
                Template by
                <a href="http://sindresorhus.com">Sindre Sorhus</a>
            </p>
            <!-- Change this out with your name and url ↓ -->
            <p>
                Created by
                <a href="http://todomvc.com">you</a>
            </p>
            <p>
                Part of
                <a href="http://todomvc.com">TodoMVC</a>
            </p>
        </footer>
    `,
    imports: [NgFor, TitleCasePipe, RouterLink],
})
export default class Todo {
    readonly todos = filteredTodos;
    readonly filter = filter;
    readonly activeTodos = activeTodos;

    @Input() set f(q: ReturnType<typeof filter> | undefined) {
        filter.set(q || 'all');
    }

    constructor() {
        const todosString = localStorage.getItem('ng_minimal_todos');
        if (todosString) {
            JSON.parse(todosString).forEach((todo: TodoItem) => {
                todos.mutate((s) => (s[todo.id] = { ...todo, editing: false }));
            });
        }
        effect(() => {
            localStorage.setItem('ng_minimal_todos', JSON.stringify(allTodos()));
        });
    }

    addTodo(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
        if (!value) return;
        todos.mutate((s) => {
            const id = Date.now().toString();
            s[id] = { content: value, id, complete: false, editing: false };
        });
        input.value = '';
    }

    updateTodo(event: Event, todo: TodoItem) {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();

        if (!value) return;
        todos.mutate((s) => {
            s[todo.id].content = value;
            s[todo.id].editing = false;
        });
    }

    deleteTodo(todo: TodoItem) {
        todos.mutate((s) => {
            delete s[todo.id];
        });
    }

    toggle(todo: TodoItem) {
        todos.mutate((s) => {
            s[todo.id].complete = !s[todo.id].complete;
        });
    }

    toggleEditMode(todo: TodoItem) {
        todos.mutate((s) => {
            s[todo.id].editing = true;
        });
    }

    toggleAll() {
        const hasIncomplete = allTodos().some((todo) => !todo.complete);
        todos.mutate((s) => {
            Object.values(s).forEach((todo) => {
                todo.complete = hasIncomplete;
            });
        });
    }

    clearComplete() {
        todos.mutate((s) => {
            Object.values(s).forEach((todo) => {
                if (todo.complete) {
                    delete s[todo.id];
                }
            });
        });
    }
}
