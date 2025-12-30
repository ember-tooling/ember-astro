# ember-astro

Ember integration with [astro.build](https://astro.build/)

## Install

```
pnpm add ember-astro ember-source@6.8.2 # or newer
```

## Setup

In your `astro.config.*`:

```js
import { defineConfig } from "astro/config";
import { ember } from "ember-astro";

// https://astro.build/config
export default defineConfig({
	integrations: [ember()],
});
```

## Usage

### Using `client:only`

<details><summary>src/components/demo.gjs</summary>

```gjs
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";

export default class HelloWorld extends Component {
	@tracked count = 0;

	increment = () => (this.count += 1);

	<template>
		<p>You have clicked the button {{this.count}} times.</p>

		<button type="button" {{on "click" this.increment}}>Click</button>
	</template>
}
```

</details>

In `src/pages/index.astro`:

```astro
---
import HelloWorld from '../components/demo.gjs';
---

<html>
  <body>
    <h1>Use Ember components directly in Astro!</h1>
    <HelloWorld client:only="ember" />
  </body>
</html>
```

## Differences in using `.astro` vs `.gjs` (or `.gts`)

### Props vs Args

Normally, in Ember arguments start with `@` (e.g.: `@foo`) and element attributes without (e.g.:
`foo`).

```gjs
const foo = 2;

<template>
	<MyComponent @foo={{2}} foo={{2}} />
	{{!          ^ argument |           }}
	{{!                     ^ attribute }}
</template>
```

However, in `.astro` files, there is no such differentiation.

In this astro template:

```astro
---
const two = 2;
---
<body>
	<MyComponent foo={2} style={{ background: 'blue' }} />
</body>
```

`foo` will be seen to `MyComponent` as `@props.foo`, and passing attributes directly is not possible -- so
`style` (normally passed along to whatever element MyComponent places `...attributes` on) will also
be an argument, `@props.style`. So `MyComponent` may look like this:

```gjs
<template>
	<div style={{@props.style}} ...attributes>
		{{!                     ^ this syntax is unusable when invoked from Astro components }}
		{{@props.foo}}
	</div>
</template>
```

With the manually specified attributes in the element space positioned _before_ `...attributes`, the
component can still _also_ be used in other ember components where `...attributes` would work, and
override any accidental attribute-as-argument passing.

### Slots

in Astro, slots are just strings of HTML, not any value or anything that can be integrated with.
So unlike `{{yield to="name"}}`, components will have to `{{{@slots.name}}}`. Note the triple
`{{{` -- this tells the framework to not perform any safety checks and to just insert the string
as HTML.

For example, in astro:

```html
<Demo client:only="ember"> content here </Demo>
```

The ember component that renders this would be written as:

```gjs
export const Demo = <template>{{{@slots.default}}}</template>;
```

Instead of the traditional:

```gjs
export const Demo = <template>{{yield}}</template>;
```

This also means that there are no block params available in astro.
So, in ember we are used to:

```gjs
Import { Demo } from './demo.gjs';

<template>
  <Demo as |x|>
    {{x.value}}
    <x.component />
    <div {{x.modifier}}>...</div>
  </Demo>
</template>
```

However, this is not possible to replicate in Astro.

## Ignoring the limitations

If you'd like to ignore Astro's component limitations, you can import an ember component, with the
known limitations of Astro, and from within there, build out your page / micro-application in Ember.
