<p align="center">
  <img src="https://raw.githubusercontent.com/andrewzhuk/remixicons/master/.github/logo.svg" alt="Remixicons">
</p>

<p align="center">
  Remix Icon is a set of 2270+ free MIT-licensed neutral-style system symbols elaborately crafted for designers and developers. 
  <br>All of the icons are free for both personal and commercial use.
  <br>Available as basic SVG icons and via first-party <a href="#react">React</a> and <a href="#vue">Vue</a> libraries.
<p>

<p align="center">
  <a href="https://remixicon.com"><strong>Browse at remixicon.com &rarr;</strong></a>
</p>

<p align="center">
    <a href="https://github.com/andrewzhuk/remixicons/releases"><img src="https://img.shields.io/npm/v/remixicons" alt="Latest Release"></a>
    <a href="https://github.com/andrewzhuk/remixicons/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/remixicons.svg" alt="License"></a>
</p>

## Basic Usage

The quickest way to use these icons is to simply copy the source for the icon you need from [https://remixicon.com](https://remixicon.com) and inline it directly into your HTML:


Both icon styles are preconfigured to be stylable by setting the `color` CSS property, either manually or using utility classes like `fill-gray-500` in a framework like [Tailwind CSS](https://tailwindcss.com).

## React

First, install `@remixicons/react` from npm:

```sh
yarn add --dev @remixicons/react
```

Now each icon can be imported individually as a React component:

```js
import { BrushIcon } from '@remixicons/react/fill'

function MyComponent() {
  return (
    <div>
      <BrushIcon className="h-5 w-5 fill-blue-500"/>
      <p>...</p>
    </div>
  )
}
```

The 24x24 line icons can be imported from `@remixicons/react/line`, and the 24x24 fill icons can be imported from `@remixicons/react/fill`.

Icons use an upper camel case naming convention and are always postfixed with the word `Icon`.


## Vue

*Note that this library currently only supports Vue 3.*

First, install `@remixicons/vue` from npm:

```sh
yarn add --dev @remixicons/vue
```

Now each icon can be imported individually as a Vue component:

```vue
<template>
  <div>
    <BrushIcon class="h-5 w-5 fill-blue-500"/>
    <p>...</p>
  </div>
</template>

<script>
import { BrushIcon } from '@remixicons/vue/fill'

export default {
  components: { BrushIcon }
}
</script>
```

The 24x24 line icons can be imported from `@remixicons/vue/line`, and the 24x24 fill icons can be imported from `@remixicons/vue/fill`.

Icons use an upper camel case naming convention and are always postfixed with the word `Icon`.


## License

This library is MIT licensed.
