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

**witch** is a [lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language)).
This is different from the C-style languages you're probably used to, if you're
used to programming. I don't know about you, but I learn by doing stuff, so let's look
at some code. Take a simple `if` statement in JavaScipt:

```javascript
if (myThing.hasChanged) {
  myThing.render();
}
```

The same can be expressed like this in **witch**:

```lisp
(?
  (myThing hasChanged)
  (render myThing)
)
```

If you are familiar with the `Array` data structure, you will notice that
the **witch** expression could be stored as an array in JavaScript:

```javascript
[ '?',
  [ 'myThing', 'hasChanged' ],
  [ 'render', 'myThing' ]
]
```

And it is! (with a little more stuff, but that's the idea!)

This is called [homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity), or
"the code is the same as how we use it". This is awesome because it means that
instead of simply being a set of instructions, we can start to view our
**code as data**!

So that's the basic idea of lisps... but **witch** runs in the browser,
right where JavaScript runs. This means we get to play with one of the
most powerful canvases around! But we have to learn a few things first...

You set variables with `=`:

```lisp
(= kitten "fluffy")
```

You print stuff out with `!`:

```lisp
(! kitten)
; fluffy
```

And like in our example before, you test things with `?` and `=?`:

```lisp
(?
  (=? kitten "fluffy")
  (! "the kitten is fluffy!")
  (! "the kitten is mean :(")
)
```

You can define functions with `@`:

```lisp
(@ checkKitten (kitten) (
  (?
    (=? kitten "fluffy")
    (! "the kitten is fluffy!")
    (! "the kitten is mean :(")
  )
))

(checkKitten "fluffy")
; the kitten is fluffy!
```

With these few things, the rest of the language is built!

If you want to learn more, check out the [documentation](/docs),
specifically [Install](/docs/install). It's super simple,
and you can write and run your own script in just a minute or two!
