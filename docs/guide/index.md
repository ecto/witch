---
layout: default
title: Documentation
---

Hello, young witch or wizard! This is a guide to get your started learning
**witch**, a language I've been working on. It's pretty simple right now!

First, **witch** is not intended for serious stuff, at least not for now.
It's probably slower than what you want, it might break, and there are warts.
With that said, you can definitely use it for simple stuff, and maybe someday
it will be awesome and you will want to teach it to everybody!

**witch** is intended to have a friendly syntax, taking my favorite parts of C, Ruby, Lisp, and Python.
There are two rules that define Witch syntax:

1. Indentation is 2 spaces, significant and required.

2. There are no non-letter symbols in builtin functionality.

I don't know about you, but I learn by doing stuff, so let's look
at some code. Take a simple `if` statement in JavaScipt:

```javascript
if (myThing.hasChanged) {
  myThing.render();
}
```

The same can be expressed like this in **witch**:

```ruby
if
  myThing hasChanged
  render myThing
```

This makes the language easier for beginners to learn by removing arcane requirements, instead choosing to map what you have to type closer to how you would say it out loud.

[...more stuff]

With these few things, the rest of the language is built!

If you want to learn more, check out the [documentation](/docs),
specifically [Install](/docs/install). It's super simple,
and you can write and run your own script in just a minute or two!
